import { useEffect, useCallback } from 'react';
import { pusherClient, CHANNELS, EVENTS } from '@/lib/pusher';

type EventCallback = (data: any) => void;

export function usePusher(channelName: string) {
  const subscribe = useCallback((eventName: string, callback: EventCallback) => {
    const channel = pusherClient.subscribe(channelName);
    channel.bind(eventName, callback);

    return () => {
      channel.unbind(eventName, callback);
      pusherClient.unsubscribe(channelName);
    };
  }, [channelName]);

  useEffect(() => {
    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [channelName]);

  return { subscribe };
}

export { CHANNELS, EVENTS }; 