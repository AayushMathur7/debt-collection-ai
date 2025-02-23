'use client';

import { useState, useEffect } from 'react';

export function useCallTimer(startTime: Date | undefined) {
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    if (!startTime) {
      setDuration(0);
      return;
    }

    const interval = setInterval(() => {
      setDuration(Math.round((new Date().getTime() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return duration;
} 