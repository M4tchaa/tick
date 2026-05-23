"use client";

import { Button } from "@/components/ui/button";
import { TimerStatus } from "@/lib/types";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

interface TimerControlsProps {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export function TimerControls({
  status,
  onStart,
  onPause,
  onResume,
  onReset,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: TimerControlsProps) {
  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isIdle = status === "idle";
  const isTimeout = status === "timeout";

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrev}
          disabled={!hasPrev}
          aria-label="Previous scene"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {isRunning ? (
          <Button
            variant="default"
            size="lg"
            onClick={onPause}
            className="min-w-[120px]"
            aria-label="Pause timer"
          >
            <Pause className="h-5 w-5 mr-2" />
            Pause
          </Button>
        ) : isPaused || isIdle ? (
          <Button
            variant="default"
            size="lg"
            onClick={isPaused ? onResume : onStart}
            className="min-w-[120px]"
            aria-label={isPaused ? "Resume timer" : "Start timer"}
          >
            <Play className="h-5 w-5 mr-2" />
            {isPaused ? "Resume" : "Start"}
          </Button>
        ) : isTimeout ? (
          <Button
            variant="default"
            size="lg"
            onClick={onReset}
            className="min-w-[120px]"
            aria-label="Reset timer"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Reset
          </Button>
        ) : null}

        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          disabled={!hasNext}
          aria-label="Next scene"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onReset}
        disabled={isIdle}
        aria-label="Reset current timer"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset Timer
      </Button>
    </div>
  );
}
