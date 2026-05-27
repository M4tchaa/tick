"use client";

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";

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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        handleCancel();
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };

    if (!sceneId) return null;

    return (
      <>
        {mode === "idle" && (
          <button
            className="absolute bottom-4 right-4 opacity-20 hover:opacity-80 transition-opacity
              border border-white/20 rounded-md px-3 py-1.5 text-xs font-mono text-foreground
              bg-transparent hover:bg-white/5 cursor-pointer z-10"
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
          <>
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm z-10"
              onClick={handleCancel}
            />
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <input
                ref={inputRef}
                className="bg-background/90 border border-ring rounded-lg px-5 py-3 font-mono
                  text-foreground text-center w-80 max-w-[85vw] text-base
                  focus:outline-none focus:ring-2 focus:ring-ring
                  placeholder:text-muted-foreground/50 shadow-lg"
                placeholder="Type cue message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                aria-label="Cue message input"
              />
            </div>
          </>
        )}

        {mode === "displaying" && (
          <>
            <div className="absolute bottom-20 left-0 right-0 flex justify-center z-0 px-4">
              <p className="max-w-lg text-center font-mono text-lg text-foreground/90 leading-relaxed">
                {displayText}
                {!isTypingComplete && (
                  <span className="inline-block w-0.5 h-5 bg-foreground ml-0.5 align-middle animate-pulse">
                    &nbsp;
                  </span>
                )}
              </p>
            </div>

            <button
              className="absolute bottom-4 right-4 opacity-20 hover:opacity-80 transition-opacity
                border border-white/20 rounded-md px-3 py-1.5 text-xs font-mono text-foreground
                bg-transparent hover:bg-white/5 cursor-pointer z-10"
              onClick={() => {
                setMode("input");
                setInputValue("");
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
              aria-label="Send cue"
            >
              Send Cue
            </button>
          </>
        )}
      </>
    );
  }
);

LiveCue.displayName = "LiveCue";
