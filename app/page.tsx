"use client";

import { useState, useCallback, useEffect } from "react";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { SceneHeader } from "@/components/timer/SceneHeader";
import { TimerControls } from "@/components/timer/TimerControls";
import { AdjustmentBar } from "@/components/timer/AdjustmentBar";
import { SceneList } from "@/components/timer/SceneList";
import { TimeUpOverlay } from "@/components/modals/TimeUpOverlay";
import { SetupModal } from "@/components/modals/SetupModal";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useScenes } from "@/hooks/useScenes";
import { useCountdown } from "@/hooks/useCountdown";
import { Maximize2, Minimize2, Trash2 } from "lucide-react";

export default function Home() {
  const {
    scenes,
    activeSceneIndex,
    activeScene,
    addScene,
    updateScene,
    deleteScene,
    reorderScenes,
    goToNext,
    goToPrev,
    resetAll,
    setActiveSceneIndex,
  } = useScenes();

  const [completedSceneIds, setCompletedSceneIds] = useState<Set<string>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleTimeout = useCallback(() => {
    if (activeScene) {
      setCompletedSceneIds(prev => {
        const next = new Set(prev);
        next.add(activeScene.id);
        return next;
      });
    }
  }, [activeScene]);

  const countdown = useCountdown(handleTimeout);

  useEffect(() => {
    if (activeScene && countdown.status === "idle") {
      countdown.reset(activeScene.durationSeconds);
    }
  }, [activeSceneIndex, activeScene, countdown]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          if (countdown.status === "running") {
            countdown.pause();
          } else if (countdown.status === "paused" || countdown.status === "idle") {
            countdown.start();
          }
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        case "ArrowRight":
          if (countdown.status === "timeout") {
            goToNext();
          }
          break;
      }
    },
    [countdown, goToNext, toggleFullscreen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleSceneSelect = (index: number) => {
    setActiveSceneIndex(index);
    setCompletedSceneIds(prev => {
      const next = new Set(prev);
      for (let i = index + 1; i < scenes.length; i++) {
        next.delete(scenes[i].id);
      }
      return next;
    });
  };

  const handleNextFromTimeout = () => {
    goToNext();
    setCompletedSceneIds(prev => {
      const next = new Set(prev);
      if (activeScene) next.delete(activeScene.id);
      return next;
    });
  };

  const handleEndEvent = () => {
    countdown.reset(0);
    setCompletedSceneIds(new Set(scenes.map(s => s.id)));
  };

  const hasPrev = activeSceneIndex > 0;
  const hasNext = activeSceneIndex < scenes.length - 1;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-xl font-bold font-mono text-foreground">TICK</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <SetupModal
            scenes={scenes}
            onAdd={addScene}
            onUpdate={updateScene}
            onDelete={deleteScene}
            onReorder={reorderScenes}
          />
          <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
            <AlertDialogTrigger>
              <Button variant="ghost" size="sm" className="text-destructive" aria-label="Reset all">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-mono">Reset All?</AlertDialogTitle>
                <AlertDialogDescription className="font-mono">
                  This will delete all scenes and reset the timer. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="font-mono">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    resetAll();
                    setCompletedSceneIds(new Set());
                    countdown.reset(0);
                  }}
                  className="font-mono bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Reset All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {activeScene ? (
          <>
            <SceneHeader
              name={activeScene.name}
              index={activeSceneIndex}
              total={scenes.length}
            />
            <TimerDisplay
              remainingSeconds={countdown.remainingSeconds}
              status={countdown.status}
              accentColor={activeScene.color}
            />
            {!isFullscreen && (
              <>
                <TimerControls
                  status={countdown.status}
                  onStart={countdown.start}
                  onPause={countdown.pause}
                  onResume={countdown.resume}
                  onReset={() => countdown.reset(activeScene.durationSeconds)}
                  onPrev={goToPrev}
                  onNext={goToNext}
                  hasPrev={hasPrev}
                  hasNext={hasNext}
                />
                <AdjustmentBar
                  status={countdown.status}
                  onAdjust={countdown.adjust}
                />
              </>
            )}
          </>
        ) : (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold font-mono">No Scenes Yet</h2>
            <p className="text-muted-foreground font-mono">
              Click Setup to add your first scene
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-border p-4">
        <SceneList
          scenes={scenes}
          activeIndex={activeSceneIndex}
          completedSceneIds={completedSceneIds}
          onSelect={handleSceneSelect}
        />
      </footer>

      {countdown.status === "timeout" && activeScene && (
        <TimeUpOverlay
          advanceMode={activeScene.advanceMode}
          onNext={handleNextFromTimeout}
          onEnd={handleEndEvent}
          isLastScene={!hasNext}
        />
      )}
    </div>
  );
}
