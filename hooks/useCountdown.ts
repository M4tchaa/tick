"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TimerStatus } from "@/lib/types";

interface UseCountdownReturn {
  remainingSeconds: number;
  status: TimerStatus;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: (durationSeconds: number) => void;
  resetAndStart: (durationSeconds: number) => void;
  playBeep: () => void;
}

export function useCountdown(onTimeout?: () => void): UseCountdownReturn {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [status, setStatus] = useState<TimerStatus>("idle");

  const startTimeRef = useRef<number | null>(null);
  const initialRemainingRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  const playBeep = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 880;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch {
      // Audio not supported
    }
  }, []);

  const handleTimeout = useCallback(() => {
    clearTimer();
    setStatus("timeout");
    playBeep();
    onTimeout?.();
  }, [clearTimer, onTimeout, playBeep]);

  const start = useCallback(() => {
    if (remainingSeconds <= 0) return;

    clearTimer();
    setStatus("running");
    startTimeRef.current = Date.now();
    initialRemainingRef.current = remainingSeconds;

    intervalRef.current = setInterval(() => {
      if (!startTimeRef.current) return;

      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const newRemaining = Math.max(0, initialRemainingRef.current - elapsed);

      setRemainingSeconds(newRemaining);

      if (newRemaining === 0) {
        handleTimeout();
      }
    }, 500);
  }, [clearTimer, handleTimeout, remainingSeconds]);

  const pause = useCallback(() => {
    if (status !== "running") return;
    clearTimer();
    setStatus("paused");
  }, [clearTimer, status]);

  const resume = useCallback(() => {
    if (status !== "paused" || remainingSeconds <= 0) return;

    clearTimer();
    setStatus("running");
    startTimeRef.current = Date.now();
    initialRemainingRef.current = remainingSeconds;

    intervalRef.current = setInterval(() => {
      if (!startTimeRef.current) return;

      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const newRemaining = Math.max(0, initialRemainingRef.current - elapsed);

      setRemainingSeconds(newRemaining);

      if (newRemaining === 0) {
        handleTimeout();
      }
    }, 500);
  }, [clearTimer, handleTimeout, remainingSeconds, status]);

  const reset = useCallback(
    (durationSeconds: number) => {
      clearTimer();
      setRemainingSeconds(durationSeconds);
      setStatus("idle");
    },
    [clearTimer]
  );

  const resetAndStart = useCallback(
    (durationSeconds: number) => {
      clearTimer();
      setRemainingSeconds(durationSeconds);
      setStatus("running");
      startTimeRef.current = Date.now();
      initialRemainingRef.current = durationSeconds;

      intervalRef.current = setInterval(() => {
        if (!startTimeRef.current) return;

        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const newRemaining = Math.max(0, initialRemainingRef.current - elapsed);

        setRemainingSeconds(newRemaining);

        if (newRemaining === 0) {
          handleTimeout();
        }
      }, 500);
    },
    [clearTimer, handleTimeout]
  );

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    remainingSeconds,
    status,
    start,
    pause,
    resume,
    reset,
    resetAndStart,
    playBeep,
  };
}
