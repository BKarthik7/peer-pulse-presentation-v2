import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { socket_id, channel_name } = req.body;
    const authResponse = pusher.authorizeChannel(socket_id, channel_name);
    res.status(200).json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 