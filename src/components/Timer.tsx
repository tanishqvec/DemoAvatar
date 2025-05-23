
import React, { useState, useEffect } from 'react';

interface TimerProps {
  duration: number;
  isRunning: boolean;
  onComplete?: () => void;
}

export const Timer: React.FC<TimerProps> = ({ 
  duration, 
  isRunning, 
  onComplete 
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  
  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, onComplete]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="bg-green-500 rounded-full w-16 h-16 flex items-center justify-center">
      <span className="text-black font-bold">{formatTime(timeLeft)}</span>
    </div>
  );
};
