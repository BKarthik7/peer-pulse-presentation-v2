import mongoose from 'mongoose';

// Types
export interface Participant {
  usn: string;
  _id?: string;
}

export interface Team {
  name: string;
  members: string[];
  _id?: string;
}

export interface Evaluation {
  teamName: string;
  evaluatorUSN: string;
  ratings: Record<string, number>;
  feedback: string;
  submittedAt: Date;
  _id?: string;
}

// Models
const ParticipantSchema = new mongoose.Schema<Participant>({
  usn: { type: String, required: true, unique: true }
});

const TeamSchema = new mongoose.Schema<Team>({
  name: { type: String, required: true, unique: true },
  members: [{ type: String, required: true }]
});

const EvaluationSchema = new mongoose.Schema<Evaluation>({
  teamName: { type: String, required: true },
  evaluatorUSN: { type: String, required: true },
  ratings: { type: Map, of: Number, required: true },
  feedback: { type: String, required: true },
  submittedAt: { type: Date, required: true }
});

// Create models
export const ParticipantModel = mongoose.model<Participant>('Participant', ParticipantSchema);
export const TeamModel = mongoose.model<Team>('Team', TeamSchema);
export const EvaluationModel = mongoose.model<Evaluation>('Evaluation', EvaluationSchema);

// Connection
let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
} 