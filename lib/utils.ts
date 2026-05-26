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

export function formatTimeInput(rawDigits: string): string {
  const digits = rawDigits.replace(/\D/g, "").slice(0, 6);
  const padded = digits.padStart(6, "0");
  return `${padded.slice(0, 2)}:${padded.slice(2, 4)}:${padded.slice(4, 6)}`;
}

export function parseTimeInput(formatted: string): number {
  const digits = formatted.replace(/\D/g, "");
  const padded = digits.padStart(6, "0");
  const h = parseInt(padded.slice(0, 2), 10) || 0;
  const m = parseInt(padded.slice(2, 4), 10) || 0;
  const s = parseInt(padded.slice(4, 6), 10) || 0;
  return h * 3600 + m * 60 + s;
}

export function secondsToTimeInputDigits(totalSeconds: number): string {
  if (totalSeconds <= 0) return "";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const formatted = String(h).padStart(2, "0") + String(m).padStart(2, "0") + String(s).padStart(2, "0");
  return formatted.replace(/^0+/, "") || "0";
}
