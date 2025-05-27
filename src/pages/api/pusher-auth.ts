import { Request, Response } from 'express';
import { pusherServer } from '@/lib/pusher';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { socket_id, channel_name } = req.body;
    const authResponse = pusherServer.authorizeChannel(socket_id, channel_name);
    res.status(200).json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 