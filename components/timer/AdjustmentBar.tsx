"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimerStatus } from "@/lib/types";
import { parseMinutesSeconds } from "@/lib/utils";
import { Plus, Minus } from "lucide-react";

interface AdjustmentBarProps {
  status: TimerStatus;
  onAdjust: (deltaSeconds: number) => void;
}

export function AdjustmentBar({ status, onAdjust }: AdjustmentBarProps) {
  const [customInput, setCustomInput] = useState("");

  const isDisabled = status === "idle" || status === "timeout";

  const handleCustomAdjust = () => {
    const seconds = parseMinutesSeconds(customInput);
    if (seconds !== 0) {
      onAdjust(seconds);
      setCustomInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCustomAdjust();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <p className="text-xs text-muted-foreground font-mono">Adjust Time</p>
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAdjust(-300)}
          disabled={isDisabled}
          aria-label="Subtract 5 minutes"
        >
          <Minus className="h-4 w-4 mr-1" />
          5m
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAdjust(-60)}
          disabled={isDisabled}
          aria-label="Subtract 1 minute"
        >
          <Minus className="h-4 w-4 mr-1" />
          1m
        </Button>

        <div className="flex items-center gap-1 mx-2">
          <Input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="mm:ss"
            className="w-20 h-8 text-center font-mono"
            disabled={isDisabled}
            aria-label="Custom time adjustment"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleCustomAdjust}
            disabled={isDisabled || !customInput}
            aria-label="Apply custom adjustment"
          >
            Set
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onAdjust(60)}
          disabled={isDisabled}
          aria-label="Add 1 minute"
        >
          <Plus className="h-4 w-4 mr-1" />
          1m
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAdjust(300)}
          disabled={isDisabled}
          aria-label="Add 5 minutes"
        >
          <Plus className="h-4 w-4 mr-1" />
          5m
        </Button>
      </div>
    </div>
  );
}
