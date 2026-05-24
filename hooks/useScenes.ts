"use client";

import { useCallback } from "react";
import { Scene, AppState, DEFAULT_STATE } from "@/lib/types";
import { useLocalStorage } from "./useLocalStorage";

interface UseScenesReturn {
  scenes: Scene[];
  activeSceneIndex: number;
  activeScene: Scene | null;
  addScene: (scene: Omit<Scene, "id">) => void;
  updateScene: (id: string, updates: Partial<Scene>) => void;
  deleteScene: (id: string) => void;
  reorderScenes: (newOrder: Scene[]) => void;
  goToNext: () => boolean;
  goToPrev: () => boolean;
  resetAll: () => void;
  setActiveSceneIndex: (index: number) => void;
}

export function useScenes(): UseScenesReturn {
  const [state, setState] = useLocalStorage<AppState>("tick_app_state", DEFAULT_STATE);

  const addScene = useCallback(
    (scene: Omit<Scene, "id">) => {
      setState(prev => {
        const firstSceneAdvanceMode = prev.scenes.length > 0 ? prev.scenes[0].advanceMode : scene.advanceMode;
        const newScene: Scene = {
          ...scene,
          advanceMode: firstSceneAdvanceMode,
          id: crypto.randomUUID(),
        };
        return {
          ...prev,
          scenes: [...prev.scenes, newScene],
        };
      });
    },
    [setState]
  );

  const updateScene = useCallback(
    (id: string, updates: Partial<Scene>) => {
      setState(prev => ({
        ...prev,
        scenes: prev.scenes.map(scene =>
          scene.id === id ? { ...scene, ...updates } : scene
        ),
      }));
    },
    [setState]
  );

  const deleteScene = useCallback(
    (id: string) => {
      setState(prev => {
        const newScenes = prev.scenes.filter(s => s.id !== id);
        let newActiveIndex = prev.activeSceneIndex;
        if (newActiveIndex >= newScenes.length) {
          newActiveIndex = Math.max(0, newScenes.length - 1);
        }
        return {
          ...prev,
          scenes: newScenes,
          activeSceneIndex: newActiveIndex,
          remainingSeconds: newScenes.length > 0 ? newScenes[newActiveIndex].durationSeconds : 0,
          timerStatus: "idle" as const,
        };
      });
    },
    [setState]
  );

  const reorderScenes = useCallback(
    (newOrder: Scene[]) => {
      setState(prev => ({
        ...prev,
        scenes: newOrder,
      }));
    },
    [setState]
  );

  const goToNext = useCallback(() => {
    let success = false;
    setState(prev => {
      if (prev.activeSceneIndex >= prev.scenes.length - 1) {
        return prev;
      }
      success = true;
      const newIndex = prev.activeSceneIndex + 1;
      return {
        ...prev,
        activeSceneIndex: newIndex,
        remainingSeconds: prev.scenes[newIndex].durationSeconds,
        timerStatus: "idle" as const,
      };
    });
    return success;
  }, [setState]);

  const goToPrev = useCallback(() => {
    let success = false;
    setState(prev => {
      if (prev.activeSceneIndex <= 0) {
        return prev;
      }
      success = true;
      const newIndex = prev.activeSceneIndex - 1;
      return {
        ...prev,
        activeSceneIndex: newIndex,
        remainingSeconds: prev.scenes[newIndex].durationSeconds,
        timerStatus: "idle" as const,
      };
    });
    return success;
  }, [setState]);

  const resetAll = useCallback(() => {
    setState(DEFAULT_STATE);
  }, [setState]);

  const setActiveSceneIndex = useCallback(
    (index: number) => {
      setState(prev => {
        if (index < 0 || index >= prev.scenes.length) {
          return prev;
        }
        return {
          ...prev,
          activeSceneIndex: index,
          remainingSeconds: prev.scenes[index].durationSeconds,
          timerStatus: "idle" as const,
        };
      });
    },
    [setState]
  );

  const activeScene = state.scenes[state.activeSceneIndex] ?? null;

  return {
    scenes: state.scenes,
    activeSceneIndex: state.activeSceneIndex,
    activeScene,
    addScene,
    updateScene,
    deleteScene,
    reorderScenes,
    goToNext,
    goToPrev,
    resetAll,
    setActiveSceneIndex,
  };
}
