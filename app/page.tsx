"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { SceneHeader } from "@/components/timer/SceneHeader";
import { TimerControls } from "@/components/timer/TimerControls";
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
} from "@/components/ui/alert-dialog";
import { useScenes } from "@/hooks/useScenes";
import { useCountdown } from "@/hooks/useCountdown";
import { Maximize2, Minimize2, Trash2 } from "lucide-react";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
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
  const [setupModalOpen, setSetupModalOpen] = useState(false);

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
  const shouldAutoStartRef = useRef(false);
  const prevSceneIdRef = useRef<string | null>(null);
  const countdownRef = useRef(countdown);

  useEffect(() => {
    countdownRef.current = countdown;
  }, [countdown]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (scenes.length === 0) {
      setSetupModalOpen(false);
    }
  }, [scenes.length]);

  useEffect(() => {
    if (!activeScene) return;

    const sceneChanged = prevSceneIdRef.current !== activeScene.id;
    
    if (sceneChanged) {
      prevSceneIdRef.current = activeScene.id;
      
      if (shouldAutoStartRef.current) {
        shouldAutoStartRef.current = false;
        countdownRef.current.resetAndStart(activeScene.durationSeconds);
      } else {
        countdownRef.current.reset(activeScene.durationSeconds);
      }
    }
  }, [activeSceneIndex, activeScene]);

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

  const handleSceneSelect = useCallback(
    (index: number) => {
      setActiveSceneIndex(index);
      setCompletedSceneIds(prev => {
        const next = new Set(prev);
        for (let i = index + 1; i < scenes.length; i++) {
          next.delete(scenes[i].id);
        }
        return next;
      });
    },
    [scenes, setActiveSceneIndex]
  );

  const handleNextFromTimeout = useCallback(() => {
    goToNext();
    setCompletedSceneIds(prev => {
      const next = new Set(prev);
      if (activeScene) next.delete(activeScene.id);
      return next;
    });
  }, [activeScene, goToNext]);

  const handleNextAutoAdvance = useCallback(() => {
    setCompletedSceneIds(prev => {
      const next = new Set(prev);
      if (activeScene) next.delete(activeScene.id);
      return next;
    });
    shouldAutoStartRef.current = true;
    goToNext();
  }, [activeScene, goToNext]);

  const handleEndEvent = useCallback(() => {
    countdown.reset(0);
    setCompletedSceneIds(new Set(scenes.map(s => s.id)));
  }, [countdown, scenes]);

  const hasPrev = activeSceneIndex > 0;
  const hasNext = activeSceneIndex < scenes.length - 1;

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-mono text-muted-foreground">Loading...</p>
      </div>
    );
  }

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
            open={setupModalOpen}
            onOpenChange={setSetupModalOpen}
            scenes={scenes}
            onAdd={addScene}
            onUpdate={updateScene}
            onDelete={deleteScene}
            onReorder={reorderScenes}
          />
          <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
            <button
              type="button"
              onClick={() => setShowResetDialog(true)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 text-destructive"
              aria-label="Reset all"
            >
              <Trash2 className="h-4 w-4" />
            </button>
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
              setSetupModalOpen(false);
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

      <main className="flex-1 flex flex-col p-4">
        {activeScene ? (
          <>
            <SceneHeader
              name={activeScene.name}
              index={activeSceneIndex}
              total={scenes.length}
            />
            <div className="flex-1 flex items-center justify-center relative">
              <TimerDisplay
                remainingSeconds={countdown.remainingSeconds}
                status={countdown.status}
                accentColor={activeScene.color}
              />
              {countdown.status === "timeout" && activeScene && (
                <TimeUpOverlay
                  advanceMode={activeScene.advanceMode}
                  onNext={handleNextFromTimeout}
                  onAutoNext={handleNextAutoAdvance}
                  onEnd={handleEndEvent}
                  isLastScene={!hasNext}
                />
              )}
            </div>
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
              </>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold font-mono">No Scenes Yet</h2>
              <p className="text-muted-foreground font-mono">
                Click Setup to add your first scene
              </p>
            </div>
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
    </div>
  );
}
