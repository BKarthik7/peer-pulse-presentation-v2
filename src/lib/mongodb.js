const mongoose = require('mongoose');

// MongoDB Atlas connection string
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://uname:pass@cluster0.6ovu79b.mongodb.net/peerpulse?retryWrites=true&w=majority";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error; // Don't exit process, let the caller handle the error
  }
};

// Participant Schema
const participantSchema = new mongoose.Schema({
  usn: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Team Schema
const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  members: [{
    type: String,
    required: true,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Evaluation Schema
const evaluationSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
    trim: true
  },
  evaluatorUSN: {
    type: String,
    required: true,
    trim: true
  },
  ratings: [{
    criterion: String,
    label: String,
    score: Number
  }],
  feedback: {
    type: String,
    trim: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

// Create models
const Participant = mongoose.models.Participant || mongoose.model('Participant', participantSchema);
const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);
const Evaluation = mongoose.models.Evaluation || mongoose.model('Evaluation', evaluationSchema);

module.exports = {
  connectDB,
  Participant,
  Team,
  Evaluation
}; 