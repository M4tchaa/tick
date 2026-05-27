"use client";

import { formatTime } from "@/lib/utils";
import { TimerStatus } from "@/lib/types";

interface TimerDisplayProps {
  remainingSeconds: number;
  status: TimerStatus;
  accentColor?: string;
}

export function TimerDisplay({ remainingSeconds, status, accentColor }: TimerDisplayProps) {
  const isWarning = remainingSeconds <= 60 && remainingSeconds > 0 && status !== "timeout";
  const isTimeout = status === "timeout";

  let textColor = "text-foreground";
  let additionalClasses = "";

  if (isTimeout) {
    textColor = "text-danger";
    additionalClasses = "animate-pulse-warning";
  } else if (isWarning) {
    textColor = "text-warning";
    additionalClasses = "animate-pulse-warning";
  } else if (accentColor) {
    textColor = "";
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`font-bold font-mono tracking-wider ${textColor} ${additionalClasses}`}
        style={{
          fontSize: "clamp(4rem, 12vw, 10rem)",
          lineHeight: 1,
        }}
      >
        {formatTime(remainingSeconds)}
      </div>
    </div>
  );
}
