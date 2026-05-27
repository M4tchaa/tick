"use client";

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { X } from "lucide-react";

interface LiveCueHandle {
  trigger: () => void;
}

interface LiveCueProps {
  sceneId: string | null;
}

export const LiveCue = forwardRef<LiveCueHandle, LiveCueProps>(
  ({ sceneId }, ref) => {
    const [mode, setMode] = useState<"idle" | "input" | "displaying">("idle");
    const [cueText, setCueText] = useState("");
    const [displayText, setDisplayText] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [isTypingComplete, setIsTypingComplete] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      trigger: () => {
        setMode("input");
        setInputValue("");
        setTimeout(() => inputRef.current?.focus(), 0);
      },
    }));

    useEffect(() => {
      setMode("idle");
      setCueText("");
      setDisplayText("");
      setInputValue("");
      setIsTypingComplete(false);
    }, [sceneId]);

    useEffect(() => {
      if (mode !== "displaying") return;

      const delays = cueText.split("").map(() => 20 + Math.random() * 30);
      let index = 0;
      setDisplayText("");
      setIsTypingComplete(false);

      const typeNext = () => {
        if (index < cueText.length) {
          setDisplayText(cueText.slice(0, index + 1));
          index++;
          setTimeout(typeNext, delays[index - 1]);
        } else {
          setIsTypingComplete(true);
        }
      };

      const timeoutId = setTimeout(typeNext, 30);
      return () => clearTimeout(timeoutId);
    }, [mode, cueText]);

    const handleSubmit = () => {
      if (!inputValue.trim()) return;
      setCueText(inputValue.trim());
      setMode("displaying");
    };

    const handleCancel = () => {
      setMode("idle");
      setInputValue("");
    };

    const handleDelete = () => {
      setMode("idle");
      setCueText("");
      setDisplayText("");
      setIsTypingComplete(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        handleCancel();
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };

    if (!sceneId) return null;

    const containerClass =
      mode === "displaying"
        ? "flex-1 flex flex-col items-center justify-center"
        : "flex items-center justify-center py-2 px-4 min-h-[44px]";

    return (
      <div className={containerClass}>
        {mode === "idle" && (
          <button
            className="opacity-30 hover:opacity-80 transition-opacity
              border border-white/20 rounded-md px-3 py-1 text-xs font-mono text-foreground
              bg-transparent hover:bg-white/5 cursor-pointer"
            onClick={() => {
              setMode("input");
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            aria-label="Send cue"
          >
            Send Cue
          </button>
        )}

        {mode === "input" && (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              className="bg-transparent border-b border-ring px-2 py-1 font-mono
                text-foreground text-center w-72 max-w-[85vw] text-base
                focus:outline-none focus:border-foreground transition-colors"
              placeholder="Type cue..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              aria-label="Cue message input"
            />
          </div>
        )}

        {mode === "displaying" && (
          <>
            <div className="flex-1 flex items-center justify-center px-4">
              <div className="flex items-center gap-3">
                <div className="border-y border-white/20 py-3 px-6">
                  <p className="font-mono text-3xl text-foreground/90 text-center min-w-0 max-w-lg">
                    {displayText}
                    {!isTypingComplete && (
                      <span className="inline-block w-0.5 h-8 bg-foreground ml-0.5 align-middle animate-blink-cursor">
                        &nbsp;
                      </span>
                    )}
                  </p>
                </div>
                <button
                  className="opacity-40 hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                  onClick={handleDelete}
                  aria-label="Delete cue"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="py-2 px-4">
              <button
                className="opacity-30 hover:opacity-80 transition-opacity
                  border border-white/20 rounded-md px-3 py-1 text-xs font-mono text-foreground
                  bg-transparent hover:bg-white/5 cursor-pointer"
                onClick={() => {
                  setMode("input");
                  setTimeout(() => inputRef.current?.focus(), 0);
                }}
                aria-label="Send cue"
              >
                Send Cue
              </button>
            </div>
          </>
        )}
      </div>
    );
  }
);

LiveCue.displayName = "LiveCue";
