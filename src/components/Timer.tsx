
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface TimerProps {
  isActive: boolean;
  onTimeUpdate?: (time: number) => void;
  syncedTime?: number;
  readonly?: boolean;
}

const Timer: React.FC<TimerProps> = ({ isActive, onTimeUpdate, syncedTime, readonly = false }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (syncedTime !== undefined) {
      setTime(syncedTime);
    }
  }, [syncedTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && !readonly) {
      interval = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 1;
          if (onTimeUpdate) {
            onTimeUpdate(newTime);
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, readonly, onTimeUpdate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (!isActive) return 'text-gray-400';
    if (time < 300) return 'text-green-600'; // First 5 minutes
    if (time < 600) return 'text-yellow-600'; // 5-10 minutes
    return 'text-red-600'; // Over 10 minutes
  };

  return (
    <Card className="text-center">
      <CardContent className="py-8">
        <div className={`text-6xl font-mono font-bold ${getTimerColor()}`}>
          {formatTime(time)}
        </div>
        <div className="mt-2 text-sm text-gray-500">
          {isActive ? 'Presentation in progress' : 'Timer stopped'}
        </div>
        {readonly && (
          <div className="mt-1 text-xs text-blue-500">
            Synced with admin
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Timer;
