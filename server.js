require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { connectDB, Participant, Team } = require('./src/lib/mongodb.js');

const app = express();
const httpServer = createServer(app);

// Enable CORS for all routes
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: true,
    credentials: true
  }
});

// Connect to MongoDB with retry logic
let isConnected = false;
const connectWithRetry = async () => {
  try {
    await connectDB();
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    isConnected = false;
    // Retry connection after 5 seconds
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle presentation events
  socket.on('presentationStarting', (data) => {
    console.log('Presentation starting:', data);
    io.emit('presentationStarting', data);
  });

  socket.on('presentationStarted', (data) => {
    console.log('Presentation started:', data);
    io.emit('presentationStarted', data);
  });

  socket.on('presentationEnded', (data) => {
    console.log('Presentation ended:', data);
    io.emit('presentationEnded', data);
  });

  socket.on('timeSync', (data) => {
    console.log('Time sync:', data);
    io.emit('timeSync', data);
  });

  socket.on('evaluationForm', (data) => {
    console.log('Evaluation form:', data);
    io.emit('evaluationForm', data);
  });

  socket.on('evaluationSubmitted', (data) => {
    console.log('Evaluation submitted:', data);
    io.emit('evaluationSubmitted', data);
  });

  socket.on('presentationReset', () => {
    console.log('Presentation reset');
    io.emit('presentationReset');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Upload endpoint
app.post('/api/upload', async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!isConnected) {
    return res.status(503).json({ message: 'Database connection not available' });
  }

  try {
    const { type, data } = req.body;

    if (type === 'participants') {
      // Handle participant upload - data is already in the correct format [[usn1], [usn2], ...]
      const usns = data.map((row) => row[0]).filter((usn) => usn && usn.trim());
      
      // Create participants in bulk
      const participants = await Promise.all(
        usns.map(async (usn) => {
          try {
            return await Participant.create({ usn });
          } catch (error) {
            // Skip if USN already exists
            if (error.code === 11000) return null;
            throw error;
          }
        })
      );

      const createdParticipants = participants.filter(p => p !== null);
      return res.status(200).json({
        message: 'Participants uploaded successfully',
        count: createdParticipants.length
      });
    }

    if (type === 'teams') {
      // Handle team upload
      const teams = data.map((row) => ({
        name: row[0] || '',
        members: row.slice(1).filter((member) => member && member.trim())
      })).filter((team) => team.name);

      // Create teams in bulk
      const createdTeams = await Promise.all(
        teams.map(async (team) => {
          try {
            return await Team.create(team);
          } catch (error) {
            console.error('Error creating team:', error);
            return null;
          }
        })
      );

      const successfulTeams = createdTeams.filter(t => t !== null);
      return res.status(200).json({
        message: 'Teams uploaded successfully',
        count: successfulTeams.length
      });
    }

    return res.status(400).json({ message: 'Invalid upload type' });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

const port = 8080;

// Start server
httpServer.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Socket.IO server is ready');
}); 