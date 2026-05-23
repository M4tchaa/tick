"use client";

import { useState, useEffect, useCallback } from "react";
import { LOCAL_STORAGE_KEY } from "@/lib/types";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch {
        // localStorage might be unavailable or quota exceeded
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}

export function useAppState() {
  return useLocalStorage(LOCAL_STORAGE_KEY, {
    scenes: [],
    activeSceneIndex: 0,
    remainingSeconds: 0,
    timerStatus: "idle" as "idle" | "running" | "paused" | "timeout",
    adjustmentLog: [],
  });
}
