import { Server as SocketIOServer } from 'socket.io';
import { connectDB, Evaluation } from '../src/lib/mongodb.js';

export default function socketHandler(server) {
  const io = new SocketIOServer(server, {
    path: '/api/socket',
    addTrailingSlash: false,
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('presentationStarting', (data) => {
      io.emit('presentationStarting', data);
    });

    socket.on('presentationStarted', (data) => {
      io.emit('presentationStarted', data);
    });

    socket.on('presentationEnded', (data) => {
      io.emit('presentationEnded', data);
    });

    socket.on('timeSync', (data) => {
      io.emit('timeSync', data);
    });

    socket.on('evaluationForm', (data) => {
      io.emit('evaluationForm', data);
    });

    socket.on('evaluationSubmitted', async (data) => {
      try {
        await connectDB();
        const evaluation = await Evaluation.create({
          teamName: data.team,
          evaluatorUSN: data.evaluator,
          ratings: data.evaluation.ratings,
          feedback: data.evaluation.feedback,
          submittedAt: new Date()
        });

        io.emit('evaluationSubmitted', {
          ...data,
          evaluationId: evaluation._id
        });

        const teamEvaluations = await Evaluation.find({ teamName: data.team });
        io.emit('teamEvaluations', {
          team: data.team,
          evaluations: teamEvaluations
        });
      } catch (error) {
        console.error('Error storing evaluation:', error);
        socket.emit('evaluationError', {
          message: 'Failed to store evaluation'
        });
      }
    });

    socket.on('presentationReset', () => {
      io.emit('presentationReset');
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
} 