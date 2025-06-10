import { useEffect, useState, useRef } from "react";

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number): string => String(num).padStart(2, "0");

  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
};

const useCountdownTimer = (
  initialSeconds: number,
  resetKey?: unknown
): string => {
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSecondsLeft(initialSeconds);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [initialSeconds, resetKey]);

  return formatTime(secondsLeft);
};

export default useCountdownTimer;
