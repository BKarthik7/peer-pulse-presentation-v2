import Pusher from 'pusher-js';
import PusherServer from 'pusher';

// Client-side Pusher instance
export const pusherClient = new Pusher(import.meta.env.VITE_PUSHER_KEY || '', {
  cluster: import.meta.env.VITE_PUSHER_CLUSTER || '',
  forceTLS: true,
});

// Server-side Pusher instance
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.PUSHER_CLUSTER || '',
  useTLS: true,
});

// Channel names
export const CHANNELS = {
  PRESENTATION: 'presentation',
  EVALUATION: 'evaluation',
};

// Event names
export const EVENTS = {
  PRESENTATION_STARTING: 'presentation-starting',
  PRESENTATION_STARTED: 'presentation-started',
  PRESENTATION_ENDED: 'presentation-ended',
  TIME_SYNC: 'time-sync',
  EVALUATION_FORM: 'evaluation-form',
  EVALUATION_SUBMITTED: 'evaluation-submitted',
  TEAM_EVALUATIONS: 'team-evaluations',
  PRESENTATION_RESET: 'presentation-reset',
}; 