import { Request, Response } from 'express';
const { connectDB, Participant, Team } = require('@/lib/mongodb');

interface ParticipantType {
  usn: string;
  _id?: string;
}

interface TeamType {
  name: string;
  members: string[];
  _id?: string;
}

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { type, data } = req.body;

    if (type === 'participants') {
      const usns = data.map((row: string[]) => row[0]).filter((usn: string) => usn && usn.trim());
      
      const participants = await Promise.all(
        usns.map(async (usn: string) => {
          try {
            return await Participant.create({ usn });
          } catch (error) {
            if ((error as any).code === 11000) return null;
            throw error;
          }
        })
      );

      const createdParticipants = participants.filter((p: ParticipantType | null) => p !== null);
      return res.status(200).json({
        message: 'Participants uploaded successfully',
        count: createdParticipants.length
      });
    }

    if (type === 'teams') {
      const teams = data.map((row: string[]) => ({
        name: row[0] || '',
        members: row.slice(1).filter((member: string) => member && member.trim())
      })).filter((team: TeamType) => team.name);

      const createdTeams = await Promise.all(
        teams.map(async (team: TeamType) => {
          try {
            return await Team.create(team);
          } catch (error) {
            console.error('Error creating team:', error);
            return null;
          }
        })
      );

      const successfulTeams = createdTeams.filter((t: TeamType | null) => t !== null);
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
} 