"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface TimeUpOverlayProps {
  advanceMode: "manual" | "auto";
  onNext: () => void;
  onEnd: () => void;
  isLastScene: boolean;
}

export function TimeUpOverlay({ advanceMode, onNext, onEnd, isLastScene }: TimeUpOverlayProps) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (advanceMode !== "auto") return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [advanceMode]);

  useEffect(() => {
    if (advanceMode === "auto" && countdown === 0) {
      onNext();
    }
  }, [advanceMode, countdown, onNext]);

  return (
    <div className="fixed inset-0 bg-background/95 flex items-center justify-center z-50">
      <div className="text-center space-y-6">
        <h2 className="text-6xl font-bold text-danger animate-pulse-warning font-mono">
          TIME&apos;S UP
        </h2>

        {advanceMode === "auto" && countdown > 0 && (
          <p className="text-2xl text-muted-foreground font-mono">
            Next scene in {countdown}...
          </p>
        )}

        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={onNext}
            disabled={isLastScene}
            className="min-w-[140px]"
            aria-label="Next scene"
          >
            {isLastScene ? "No More Scenes" : "Next Scene"}
          </Button>
          <Button
            variant="destructive"
            size="lg"
            onClick={onEnd}
            className="min-w-[140px]"
            aria-label="End event"
          >
            End Event
          </Button>
        </div>

        {advanceMode === "auto" && countdown > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onNext}
            className="mt-4"
            aria-label="Skip countdown and go to next scene"
          >
            Skip →
          </Button>
        )}
      </div>
    </div>
  );
}
