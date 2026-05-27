import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  return [h, m, s].map(v => String(v).padStart(2, "0")).join(":");
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function parseMinutesSeconds(input: string): number {
  const parts = input.split(":");
  const m = parseInt(parts[0] || "0", 10) || 0;
  const s = parseInt(parts[1] || "0", 10) || 0;
  return m * 60 + s;
}
