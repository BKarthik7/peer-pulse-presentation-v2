import { Request, Response } from 'express';
import { connectDB, Participant, Team } from '@/lib/mongodb';

export const uploadHandler = async (req: Request, res: Response) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { type, data } = req.body;

    if (type === 'participants') {
      // Handle participant upload - data is already in the correct format [[usn1], [usn2], ...]
      const usns = data.map((row: string[]) => row[0]).filter((usn: string) => usn && usn.trim());
      
      // Create participants in bulk
      const participants = await Promise.all(
        usns.map(async (usn: string) => {
          try {
            return await Participant.create({ usn });
          } catch (error: any) {
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
      const teams = data.map((row: string[]) => ({
        name: row[0] || '',
        members: row.slice(1).filter((member: string) => member && member.trim())
      })).filter((team: any) => team.name);

      // Create teams in bulk
      const createdTeams = await Promise.all(
        teams.map(async (team: any) => {
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
}; 