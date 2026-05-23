export interface Scene {
  id: string;
  name: string;
  durationSeconds: number;
  advanceMode: "manual" | "auto";
  color?: string;
  scheduledAt?: string;
}

export type TimerStatus = "idle" | "running" | "paused" | "timeout";

export interface AdjustmentEntry {
  timestamp: string;
  deltaSeconds: number;
  sceneId: string;
}

export interface AppState {
  scenes: Scene[];
  activeSceneIndex: number;
  remainingSeconds: number;
  timerStatus: TimerStatus;
  adjustmentLog: AdjustmentEntry[];
}

export const DEFAULT_STATE: AppState = {
  scenes: [],
  activeSceneIndex: 0,
  remainingSeconds: 0,
  timerStatus: "idle",
  adjustmentLog: [],
};

export const LOCAL_STORAGE_KEY = "tick_app_state";
