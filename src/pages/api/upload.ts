import { Request, Response } from 'express';
import { connectDB, EvaluationModel } from '@/lib/mongodb';
import { pusherServer, CHANNELS, EVENTS } from '@/lib/pusher';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { teamName, evaluatorUSN, evaluation } = req.body;

    const newEvaluation = await EvaluationModel.create({
      teamName,
      evaluatorUSN,
      ratings: evaluation.ratings,
      feedback: evaluation.feedback,
      submittedAt: new Date()
    });

    // Trigger events using Pusher
    await pusherServer.trigger(CHANNELS.EVALUATION, EVENTS.EVALUATION_SUBMITTED, {
      team: teamName,
      evaluator: evaluatorUSN,
      evaluation,
      evaluationId: newEvaluation._id
    });

    const teamEvaluations = await EvaluationModel.find({ teamName });
    await pusherServer.trigger(CHANNELS.EVALUATION, EVENTS.TEAM_EVALUATIONS, {
      team: teamName,
      evaluations: teamEvaluations
    });

    res.status(200).json({ success: true, evaluation: newEvaluation });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 