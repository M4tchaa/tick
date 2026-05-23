# AGENTS.md — Tick v1.0

---

## 0. Konteks Proyek

**Tick** adalah web app Timer/Countdown untuk Event Organizer. Satu halaman, no backend, no auth. State disimpan di `localStorage`.

**Status saat ini:** ✅ App built and tested. Semua fitur utama sudah diimplementasi.

---

## 1. Tech Stack & Versi

```
Framework   : Next.js 14.2.35 (App Router, TypeScript strict mode)
Styling     : Tailwind CSS v3
UI Library  : shadcn/ui (@base-ui/react primitives)
State       : React useState + useCallback + useEffect (NO external state lib)
Persistence : Browser localStorage
Timer       : Custom hook — gunakan Date.now() sebagai anchor
Timezone    : date-fns-tz (Asia/Jakarta / WIB)
Testing     : Jest + React Testing Library
Linting     : ESLint + Prettier (config default Next.js)
Deployment  : Vercel ready
```

**Jangan menambahkan dependency di luar daftar ini tanpa alasan eksplisit.**

---

## 2. Struktur Direktori

```
tick/
├── app/
│   ├── layout.tsx           # Root layout, dark mode class
│   ├── page.tsx             # Entry point — orchestrates all components
│   └── globals.css          # Tailwind base + CSS vars + pulse animation
├── components/
│   ├── timer/
│   │   ├── TimerDisplay.tsx     # Hero countdown display
│   │   ├── SceneHeader.tsx      # Nama scene + indikator urutan
│   │   ├── TimerControls.tsx    # Start/Pause/Resume/Reset + Prev/Next
│   │   ├── AdjustmentBar.tsx    # Tombol ±1m ±5m + custom mm:ss input
│   │   └── SceneList.tsx        # Panel daftar scene (collapsible)
│   └── modals/
│       ├── SetupModal.tsx       # Form buat/edit/reorder/delete scene
│       └── TimeUpOverlay.tsx    # Overlay saat countdown = 0
├── components/ui/             # shadcn/ui components (auto-generated)
├── hooks/
│   ├── useCountdown.ts        # Core timer logic dengan Date.now() anchor
│   ├── useScenes.ts           # Scene CRUD + navigation
│   └── useLocalStorage.ts     # Generic localStorage sync hook
├── lib/
│   ├── types.ts               # Semua TypeScript interface/type
│   ├── constants.ts           # Color palette, default values
│   └── utils.ts               # formatTime, clamp, parseMinutesSeconds, cn
├── __tests__/
│   ├── hooks/
│   │   ├── useCountdown.test.ts
│   │   └── useScenes.test.ts
│   └── lib/
│       └── utils.test.ts
├── jest.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 3. TypeScript Types (Canonical)

Definisikan di `lib/types.ts`. Semua komponen dan hook **wajib import dari sini**.

```typescript
export interface Scene {
  id: string;                  // crypto.randomUUID()
  name: string;
  durationSeconds: number;
  advanceMode: "manual" | "auto";  // WAJIB dipilih saat create scene
  color?: string;              // Hex, e.g. "#238a7e" (nice-to-have)
  scheduledAt?: string;        // "HH:mm" WIB (nice-to-have)
}

export type TimerStatus = "idle" | "running" | "paused" | "timeout";

export interface AdjustmentEntry {
  timestamp: string;           // ISO string
  deltaSeconds: number;        // + tambah, - kurang
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
```

---

## 4. Konvensi Koding

### Umum
- **TypeScript strict mode** — tidak ada `any`, tidak ada `@ts-ignore`.
- Semua komponen adalah **functional component** dengan arrow function.
- **Named export** untuk semua komponen dan hook. Default export hanya untuk `page.tsx` dan `layout.tsx`.
- File/folder menggunakan **PascalCase** untuk komponen, **camelCase** untuk hooks dan utils.

### Styling
- Gunakan **Tailwind utility classes** sebagai primary styling.
- Custom CSS hanya di `globals.css` untuk CSS variable dan keyframe animation.
- Warna menggunakan CSS variables di `globals.css`:
  ```css
  :root {
    --background: #121212;
    --foreground: #ffffff;
    --color-surface: #238a7e;
    --color-warning: #F59E0B;
    --color-danger: #EF4444;
    --color-muted: #3A3A3A;
  }
  ```
- Dark mode selalu aktif via class `dark` di `<html>`.

### Timer Logic
- **WAJIB**: Gunakan `Date.now()` sebagai anchor waktu, bukan akumulasi `setInterval`.
  ```typescript
  const startTime = Date.now();
  const initialRemaining = remainingSeconds;
  const interval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const newRemaining = Math.max(0, initialRemaining - elapsed);
    setRemainingSeconds(newRemaining);
    if (newRemaining === 0) handleTimeout();
  }, 500);
  ```
- Selalu `clearInterval` saat komponen unmount atau timer di-pause/reset.
- Jangan simpan `intervalId` di state — gunakan `useRef`.

### localStorage
- Key tunggal: `"tick_app_state"`.
- Selalu wrap read/write dalam `try-catch`.
- Jangan simpan fungsi atau class instance, hanya plain object.

---

## 5. Task List (Status)

### ✅ Phase 1 — Foundation (COMPLETE)
- [x] T-01: Setup Next.js dengan TypeScript, Tailwind, shadcn/ui
- [x] T-02: Definisikan semua types di `lib/types.ts`
- [x] T-03: Buat `globals.css` dengan CSS variables
- [x] T-04: Buat `tailwind.config.ts` dengan custom colors
- [x] T-05: Buat `useLocalStorage` hook

### ✅ Phase 2 — Core Hooks (COMPLETE)
- [x] T-06: Buat `useScenes` hook
- [x] T-07: Buat `useCountdown` hook
- [x] T-08: Unit tests untuk `useScenes`
- [x] T-09: Unit tests untuk `useCountdown`

### ✅ Phase 3 — UI Components (COMPLETE)
- [x] T-10: Buat `TimerDisplay`
- [x] T-11: Buat `SceneHeader`
- [x] T-12: Buat `TimerControls`
- [x] T-13: Buat `AdjustmentBar` (mm:ss custom input)
- [x] T-14: Buat `SceneList`
- [x] T-15: Buat `TimeUpOverlay` (support manual/auto advance)
- [x] T-16: Buat `SetupModal` (advance mode selector, up/down reorder)

### ✅ Phase 4 — Page Assembly (COMPLETE)
- [x] T-17: Rakit semua komponen di `app/page.tsx`
- [x] T-18: Implementasi Fullscreen API
- [x] T-19: Implementasi localStorage persistence
- [x] T-20: Tombol "Reset All" dengan AlertDialog

### ✅ Phase 5 — Polish & NFR (COMPLETE)
- [x] T-21: Visual warning < 60 detik (color + pulse animation)
- [x] T-22: Keyboard shortcuts: `Space` = play/pause, `F` = fullscreen, `→` = next scene
- [x] T-23: Responsive check
- [x] T-24: Accessibility — `aria-label` pada semua tombol
- [x] T-25: Test coverage ~76% (hooks + lib)

### ⏳ Phase 6 — Nice-to-Have (BELUM DIKERJAKAN)
- [ ] T-26: Color per scene — color picker di SetupModal
- [ ] T-27: Auto-schedule — input "scheduledAt" per scene

---

## 6. Komponen: Spec Detail

### `TimerDisplay`
```typescript
interface TimerDisplayProps {
  remainingSeconds: number;
  status: TimerStatus;
  accentColor?: string;
}
```
- Format: `hh:mm:ss` menggunakan `lib/utils.ts > formatTime`
- Font: monospace, `font-bold`, ukuran `clamp(4rem, 12vw, 10rem)`
- Saat `status === "timeout"`: teks `var(--color-danger)` + animasi pulse
- Saat `remainingSeconds < 60`: teks `var(--color-warning)` + animasi pulse

### `useCountdown` Hook API
```typescript
interface UseCountdownReturn {
  remainingSeconds: number;
  status: TimerStatus;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: (durationSeconds: number) => void;
  adjust: (deltaSeconds: number) => void;
  playBeep: () => void;  // Web Audio API beep
}
```

### `useScenes` Hook API
```typescript
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
```

---

## 7. Utils (lib/utils.ts)

```typescript
export function formatTime(totalSeconds: number): string {
  // 3661 → "01:01:01"
}

export function clamp(value: number, min: number, max: number): number {
  // clamp(15, 0, 10) → 10
}

export function parseMinutesSeconds(input: string): number {
  // "05:30" → 330
}

export function cn(...inputs: ClassValue[]): string {
  // Tailwind class merger (shadcn)
}
```

---

## 8. Testing Guidelines

- Framework: **Jest + React Testing Library**
- Jalankan: `npm test` atau `npm run test:coverage`
- Target: **≥ 80% coverage** pada `hooks/` dan `lib/`

### Hal yang wajib ditest:
| File | Skenario Test |
|---|---|
| `useCountdown` | reset, adjust +/−, playBeep |
| `useScenes` | addScene, updateScene, deleteScene, goToNext, goToPrev, resetAll |
| `utils` | formatTime, clamp, parseMinutesSeconds |

---

## 9. Do's & Don'ts

### ✅ DO
- Gunakan `crypto.randomUUID()` untuk generate scene ID.
- Gunakan `useRef` untuk menyimpan `intervalId`.
- Gunakan `useCallback` pada fungsi yang dipass ke child komponen.
- Tambahkan `"use client"` di semua komponen yang menggunakan hooks.
- Handle edge case: scene list kosong, adjustment yang membuat remaining < 0.

### ❌ DON'T
- Jangan gunakan `any` di TypeScript.
- Jangan akumulasi waktu dari `setInterval` saja — selalu anchor ke `Date.now()`.
- Jangan panggil `localStorage` langsung di komponen — gunakan `useLocalStorage` hook.
- Jangan buat state baru di luar `useScenes` dan `useCountdown` tanpa alasan jelas.
- Jangan install library state management (Redux, Zustand, Jotai).
- Jangan lupa `clearInterval` di cleanup function `useEffect`.

---

## 10. Definisi "Done"

Sebuah task dianggap selesai jika:
1. ✅ Kode berjalan tanpa TypeScript error (`npx tsc --noEmit` clean).
2. ✅ Tidak ada ESLint error/warning (`npm run lint` green).
3. ✅ Unit test yang relevan lolos (`npm test` green).
4. ✅ Tampilan sesuai dengan spesifikasi desain (dark mode, monospace, color vars).
5. ✅ Tidak ada regresi pada task sebelumnya.

---

## 11. Commands

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # ESLint + Prettier
npx tsc --noEmit         # Type check only
npm test                 # Run tests
npm run test:coverage    # Run tests with coverage report
```

---

*AGENTS.md — Tick v1.0 · Mei 2026*
