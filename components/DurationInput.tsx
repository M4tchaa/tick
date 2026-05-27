"use client";

import { useState, useEffect, useRef, useCallback, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { formatTime } from "@/lib/utils";
import { MAX_DURATION_SECONDS, MAX_DURATION_BUFFER } from "@/lib/duration";

interface DurationInputProps {
  value: number;
  onChange: (seconds: number) => void;
  id?: string;
}

function bufferToSeconds(buffer: string): number {
  const h = parseInt(buffer.slice(0, 2), 10) || 0;
  const m = parseInt(buffer.slice(2, 4), 10) || 0;
  const s = parseInt(buffer.slice(4, 6), 10) || 0;
  return h * 3600 + m * 60 + s;
}

function secondsToBuffer(totalSeconds: number): string {
  const clamped = Math.min(Math.max(totalSeconds, 0), MAX_DURATION_SECONDS);
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  return String(h).padStart(2, "0") + String(m).padStart(2, "0") + String(s).padStart(2, "0");
}

function parsePastedDuration(input: string): number | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;

  const hhmmss = trimmed.match(/^(\d{1,2}):(\d{1,2}):(\d{1,2})$/);
  if (hhmmss) {
    const h = parseInt(hhmmss[1], 10);
    const m = parseInt(hhmmss[2], 10);
    const s = parseInt(hhmmss[3], 10);
    return h * 3600 + m * 60 + s;
  }

  const mmss = trimmed.match(/^(\d{1,2}):(\d{1,2})$/);
  if (mmss) {
    const m = parseInt(mmss[1], 10);
    const s = parseInt(mmss[2], 10);
    return m * 60 + s;
  }

  let totalSeconds = 0;
  let found = false;

  const hMatch = trimmed.match(/(\d+)\s*h/);
  if (hMatch) {
    totalSeconds += parseInt(hMatch[1], 10) * 3600;
    found = true;
  }

  const mMatch = trimmed.match(/(\d+)\s*m\b/);
  if (mMatch) {
    totalSeconds += parseInt(mMatch[1], 10) * 60;
    found = true;
  }

  const sMatch = trimmed.match(/(\d+)\s*s\b/);
  if (sMatch) {
    totalSeconds += parseInt(sMatch[1], 10);
    found = true;
  }

  if (found) {
    return totalSeconds;
  }

  const digits = trimmed.replace(/\D/g, "").slice(-6);
  if (!digits) return null;
  const padded = digits.padStart(6, "0");
  return bufferToSeconds(padded);
}

export const DurationInput = forwardRef<HTMLInputElement, DurationInputProps>(
  ({ value, onChange, id }, ref) => {
    const [buffer, setBuffer] = useState<string>(() => secondsToBuffer(value));
    const syncedValueRef = useRef<number>(value);

  useEffect(() => {
    const clamped = Math.min(Math.max(value, 0), MAX_DURATION_SECONDS);
    if (clamped !== syncedValueRef.current) {
      setBuffer(secondsToBuffer(clamped));
      syncedValueRef.current = clamped;
    }
  }, [value]);

  const forceCursorEnd = useCallback(() => {
    requestAnimationFrame(() => {
      const input = ref && "current" in ref ? ref.current : null;
      if (input && input.selectionStart !== input.value.length) {
        input.setSelectionRange(input.value.length, input.value.length);
      }
    });
  }, [ref]);

  const emitChange = useCallback(
    (seconds: number) => {
      const clamped = Math.min(Math.max(seconds, 0), MAX_DURATION_SECONDS);
      syncedValueRef.current = clamped;
      onChange(clamped);
    },
    [onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/^\d$/.test(e.key)) {
      if (e.key !== "Backspace" && e.key !== "Delete") {
        return;
      }
    }

    e.preventDefault();

    const input = e.currentTarget;
    const selectionStart = input.selectionStart ?? 0;
    const selectionEnd = input.selectionEnd ?? 0;
    const hasSelection = selectionStart !== selectionEnd;

    let newBuffer = buffer;

    if (hasSelection) {
      newBuffer = "000000";
    }

    if (/^\d$/.test(e.key)) {
      newBuffer = (newBuffer + e.key).slice(-6);
    } else if (e.key === "Backspace" || e.key === "Delete") {
      newBuffer = "0" + newBuffer.slice(0, 5);
    }

    const rawSeconds = bufferToSeconds(newBuffer);
    if (rawSeconds > MAX_DURATION_SECONDS) {
      newBuffer = MAX_DURATION_BUFFER;
    }

    const clamped = Math.min(rawSeconds, MAX_DURATION_SECONDS);

    setBuffer(newBuffer);
    emitChange(clamped);
    forceCursorEnd();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    const parsed = parsePastedDuration(text);

    if (parsed !== null) {
      const clamped = Math.min(Math.max(parsed, 0), MAX_DURATION_SECONDS);
      const newBuffer = secondsToBuffer(clamped);
      setBuffer(newBuffer);
      emitChange(clamped);
    }

    forceCursorEnd();
  };

  const handleFocus = () => {
    forceCursorEnd();
  };

  const handleClick = () => {
    forceCursorEnd();
  };

  const rawSeconds = bufferToSeconds(buffer);
  const displaySeconds = Math.min(rawSeconds, MAX_DURATION_SECONDS);
  const display = formatTime(displaySeconds);

  return (
    <Input
      ref={ref}
      id={id}
      type="text"
      inputMode="numeric"
      readOnly
      value={display}
      placeholder="00:00:00"
      aria-label="Duration input"
      aria-valuetext={display}
      onFocus={handleFocus}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      className="font-mono"
    />
  );
});

DurationInput.displayName = "DurationInput";
