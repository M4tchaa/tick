# PRD-Tick.md
**Product Requirements Document — Tick v1.0**
*Last updated: Mei 2026*

---

## Table of Contents
1. [Product Identity](#1-product-identity)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [Core Features](#4-core-features)
5. [User Stories](#5-user-stories)
6. [Pages & Screens](#6-pages--screens)
7. [Data Model & State](#7-data-model--state)
8. [Auth & Access](#8-auth--access)
9. [Tech Stack](#9-tech-stack)
10. [Design & Branding](#10-design--branding)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Constraints & Assumptions](#12-constraints--assumptions)
13. [Out of Scope](#13-out-of-scope)

---

## 1. Product Identity

| Field | Detail |
|---|---|
| **Nama Produk** | Tick |
| **Versi** | 1.0 |
| **Tipe** | Web App — Frontend Only |
| **Platform** | Browser (Desktop-first, responsive) |
| **Target User** | Event Organizer / Time Keeper |

**Ringkasan:**
Tick adalah aplikasi countdown timer berbasis web yang dirancang untuk kebutuhan Event Organizer. Tick memungkinkan Time Keeper untuk mengatur multi-scene acara, melakukan adjustment waktu secara real-time, serta menampilkan timer dalam mode fullscreen sebagai display utama kepada peserta acara.

---

## 2. Problem Statement

Event Organizer sering mengandalkan timer manual (stopwatch fisik, spreadsheet, atau timer generik) yang tidak mendukung multi-scene, sulit di-adjust di tengah acara, dan tidak dirancang untuk ditampilkan ke layar proyektor. Tick hadir sebagai solusi terpusat: satu halaman, satu state, satu tampilan yang bisa langsung dipakai tanpa login dan tanpa setup backend.

---

## 3. Goals & Success Metrics

### Goals
- Menyederhanakan operasi Time Keeper dalam sebuah event.
- Menampilkan sisa waktu secara jelas dan mudah dibaca dari jarak jauh.
- Mendukung skenario acara multi-sesi (scene) dalam satu sesi browser.

### Success Metrics
| Metrik | Target |
|---|---|
| Page Load Time (4G) | ≤ 2 detik |
| Target Uptime | ≥ 99.5% |
| Concurrent Users | ≥ 10 pengguna simultan |
| Unit Test Coverage | ≥ 80% |
| Timer Accuracy Drift | ≤ 1 detik per 60 menit |

---

## 4. Core Features

### 4.1 Must-Have

#### F-01 · Countdown Timer
- Menampilkan waktu mundur (hh:mm:ss) berdasarkan durasi yang diset.
- Kontrol: **Start**, **Pause**, **Resume**, **Reset**.
- Visual alert ketika waktu mendekati habis (misal: < 1 menit berubah warna / blink).
- Bunyi notifikasi opsional saat countdown mencapai 00:00.

#### F-02 · Scene Management
- User dapat membuat daftar **scene/sesi acara** secara berurutan (contoh: Pembukaan → Materi 1 → QnA → Penutup).
- Setiap scene memiliki:
  - `name` — Nama scene (string)
  - `duration` — Durasi dalam menit & detik
  - `color` *(nice-to-have)* — Warna aksen scene
- Navigasi antar scene: **Prev / Next**.
- Tampilan nama scene aktif selalu terlihat di layar utama.

#### F-03 · Timeout & Next Scene
- Ketika countdown scene aktif mencapai 00:00, aplikasi otomatis:
  1. Menampilkan indikator **"TIME'S UP"**.
  2. Menunggu konfirmasi manual atau langsung melanjutkan ke scene berikutnya (konfigurabel).
- Jika scene terakhir selesai, tampilkan layar akhir acara.

#### F-04 · Real-Time Adjustment
- Saat timer berjalan, operator dapat:
  - **Tambah waktu** (+1 menit, +5 menit, atau input custom).
  - **Kurangi waktu** (−1 menit, −5 menit, atau input custom).
- Perubahan langsung terrefleksikan tanpa menghentikan timer.
- Riwayat adjustment ditampilkan sebagai log kecil (opsional, di panel operator).

#### F-05 · Persistent State (In-Browser)
- Seluruh state (daftar scene, posisi scene aktif, sisa waktu) disimpan di **`localStorage`**.
- State bertahan selama browser tab tidak ditutup dan tidak di-clear secara eksplisit.
- Tombol **"Reset All"** untuk menghapus state dan kembali ke setup awal.

---

### 4.2 Nice-to-Have

#### F-06 · Color Per Scene
- Setiap scene dapat dikonfigurasi dengan warna aksen unik.
- Warna diterapkan pada elemen: border timer, background header, dan label scene.
- Default color palette tersedia, dengan opsi color picker custom.

#### F-07 · Auto-Schedule (Fitur Penjadwalan)
- User dapat mengatur **waktu mulai** (jam HH:mm) untuk setiap scene.
- Timer otomatis mulai berjalan ketika jam sistem (WIB / Asia/Jakarta) mencapai waktu yang dijadwalkan.
- Indikator visual: "Scheduled — starts at 14:00" pada scene yang belum mulai.

---

## 5. User Stories

| ID | Sebagai… | Saya ingin… | Sehingga… |
|---|---|---|---|
| US-01 | Operator | Mengakses aplikasi tanpa login | Saya bisa langsung pakai tanpa hambatan |
| US-02 | Operator | Membuat daftar scene acara | Semua sesi acara tersusun rapi |
| US-03 | Operator | Menjalankan countdown per scene | Peserta tahu berapa waktu tersisa |
| US-04 | Operator | Menambah/mengurangi waktu saat acara berjalan | Saya bisa menyesuaikan jadwal yang molor atau lebih cepat |
| US-05 | Operator | Melihat nama scene yang sedang berjalan | Saya tidak bingung sedang di sesi mana |
| US-06 | Operator | Menerima notifikasi ketika waktu habis | Saya tahu kapan harus pindah sesi |
| US-07 | Operator | Menggunakan fullscreen mode | Timer terlihat jelas di layar proyektor |
| US-08 | Operator | Me-reset seluruh state | Saya bisa memulai ulang setup untuk event berikutnya |
| US-09 | Operator | *(Nice-to-have)* Memberi warna berbeda tiap scene | Pembeda visual antar sesi lebih mudah dibaca |
| US-10 | Operator | *(Nice-to-have)* Menjadwalkan timer otomatis | Timer mulai tanpa harus klik manual di jam tertentu |

---

## 6. Pages & Screens

Tick hanya memiliki **satu halaman** (Single Page Application).

### 6.1 Layout Utama (Non-Fullscreen)

```
┌─────────────────────────────────────────────────────┐
│  TICK                              [⛶ Fullscreen]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│              SCENE NAME                             │
│         [ Scene 2 of 5 ]                            │
│                                                     │
│              00 : 24 : 37                           │  ← Timer (hero element)
│                                                     │
│   [ ◀ Prev ]  [ ▶ Start / ⏸ Pause ]  [ Next ▶ ]   │
│                                                     │
│   Adjustment:  [ −5m ] [ −1m ]  [ +1m ] [ +5m ]    │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Scene List Panel (collapsible)                     │
│  ✓ Pembukaan · 10m                                  │
│  ▶ Materi 1 · 30m  ← ACTIVE                        │
│    QnA · 15m                                        │
│    Penutup · 5m                                     │
│                                    [ ⚙ Setup ]      │
│                                    [ 🗑 Reset All ]  │
└─────────────────────────────────────────────────────┘
```

### 6.2 Fullscreen Mode
- Hanya menampilkan: **nama scene**, **countdown timer**, dan indikator scene ke-N dari total.
- Semua kontrol operator tersembunyi (atau accessible via hover/keyboard shortcut).
- Tombol ESC atau klik sudut layar untuk keluar fullscreen.

### 6.3 Setup Modal
- Diakses via tombol ⚙ Setup.
- Form untuk membuat/edit/reorder/delete scene.
- Input per scene: Nama, Durasi (mm:ss), Warna *(nice-to-have)*, Waktu Mulai Terjadwal *(nice-to-have)*.

### 6.4 "Time's Up" State
- Overlay/animasi muncul ketika timer mencapai 00:00.
- Tombol: **"Next Scene"** atau **"End Event"** (jika scene terakhir).

---

## 7. Data Model & State

Tidak ada database. Semua state dikelola di **React state** (runtime) dan di-persist ke **`localStorage`** (cross-tab/refresh survival).

### State Shape (TypeScript)

```typescript
// Satu scene dalam acara
interface Scene {
  id: string;           // UUID
  name: string;         // "Pembukaan", "Materi 1", dsb.
  durationSeconds: number; // Total durasi dalam detik
  color?: string;       // Hex color, e.g. "#238a7e" (nice-to-have)
  scheduledAt?: string; // "HH:mm" format WIB (nice-to-have)
}

// State global aplikasi
interface AppState {
  scenes: Scene[];
  activeSceneIndex: number;
  remainingSeconds: number;
  timerStatus: "idle" | "running" | "paused" | "timeout";
  adjustmentLog: AdjustmentEntry[]; // opsional
}

interface AdjustmentEntry {
  timestamp: string;
  deltaSeconds: number; // positif = tambah, negatif = kurang
  sceneId: string;
}
```

### localStorage Key
```
tick_app_state  →  JSON.stringify(AppState)
```

---

## 8. Auth & Access

Tidak ada autentikasi. Aplikasi bersifat **open access** — siapa pun yang memiliki URL dapat menggunakannya.

- Tidak ada user account, session, atau token.
- Tidak ada role-based access.
- Keamanan data: karena no-backend, tidak ada data sensitif yang dikirim ke server.

---

## 9. Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 14+ (App Router, TypeScript) |
| Styling | Tailwind CSS v3 |
| UI Components | shadcn/ui |
| State Management | React `useState` + `useReducer` + `useEffect` |
| Persistence | Browser `localStorage` |
| Timer Engine | `setInterval` via custom hook `useCountdown` |
| Testing | Jest + React Testing Library |
| Linting | ESLint + Prettier |
| Timezone | `date-fns-tz` (Asia/Jakarta / WIB) |
| Deployment | Vercel (recommended) / Static hosting |

---

## 10. Design & Branding

### Color Palette

| Token | Hex | Penggunaan |
|---|---|---|
| `primary` | `#121212` | Background utama (dark) |
| `surface` | `#238a7e` | Aksen, tombol aktif, highlight |
| `on-primary` | `#FFFFFF` | Teks di atas background gelap |
| `warning` | `#F59E0B` | Indikator waktu hampir habis |
| `danger` | `#EF4444` | Indikator timeout / time's up |
| `muted` | `#3A3A3A` | Surface sekunder, border |

### Typography

| Elemen | Font | Weight | Size |
|---|---|---|---|
| Timer (hero) | Monospace | 700 | `clamp(4rem, 12vw, 10rem)` |
| Scene Name | Monospace | 600 | `1.5rem` – `2rem` |
| Body / Label | Monospace | 400 | `0.875rem` – `1rem` |

### Design Principles
- **Dark mode only** — tidak ada light mode toggle.
- **Minimal UI** — kontrol operator tidak boleh mengalihkan perhatian dari timer.
- **High contrast** — timer harus terbaca dari jarak 5–10 meter (proyektor).
- **Fullscreen-first** — layout dirancang agar fullscreen adalah primary display mode.

---

## 11. Non-Functional Requirements

| Kategori | Requirement |
|---|---|
| **Performance** | Page load ≤ 2 detik pada koneksi 4G |
| **Uptime** | Target 99.5% (jika di-host di Vercel/CDN) |
| **Concurrency** | Support ≥ 10 pengguna simultan (karena FE-only, ini trivial) |
| **Timer Accuracy** | Drift ≤ 1 detik per jam; gunakan `Date.now()` sebagai reference, bukan hanya `setInterval` |
| **Timezone** | Semua operasi waktu menggunakan **WIB (UTC+7 / Asia/Jakarta)** |
| **Bahasa** | UI dalam **Bahasa Inggris**, dengan dukungan label **Bahasa Indonesia** untuk nama scene |
| **Testing** | Unit test coverage ≥ 80% (logika timer, scene management, adjustment) |
| **Accessibility** | Tombol utama memiliki `aria-label`; kontras warna AA minimum |
| **Browser Support** | Chrome 110+, Firefox 110+, Edge 110+, Safari 16+ |
| **Responsiveness** | Berfungsi di layar ≥ 768px (desktop-first); mobile sebagai bonus |

---

## 12. Constraints & Assumptions

### Constraints
- **No Backend** — tidak ada API, tidak ada database, tidak ada server-side logic.
- **No Auth** — tidak ada mekanisme login/logout.
- **Single Tab** — state tidak disinkronisasi antar tab secara real-time (localStorage sync via `storage` event bisa ditambahkan sebagai enhancement).
- **Browser Dependency** — jika user menutup tab, timer berhenti. Ini adalah perilaku yang disadari dan diterima.

### Assumptions
- User (operator) mengakses aplikasi dari perangkat yang sama dengan yang digunakan untuk display (atau gunakan mirror screen).
- Tidak ada kebutuhan untuk multi-operator (kolaborasi real-time).
- Durasi scene diinput secara manual sebelum acara dimulai.
- Internet stabil tersedia untuk initial page load; setelah itu aplikasi berfungsi offline (karena FE-only).

---

## 13. Out of Scope

- Backend API atau database apapun.
- Autentikasi / manajemen user.
- Multi-device sync / real-time collaboration.
- Export/import jadwal (file .csv/.json) — *dapat menjadi v2 feature*.
- Integrasi kalender eksternal (Google Calendar, dsb.).
- Mobile app (iOS/Android native).
- Fitur chat atau komunikasi antar operator.
- Analytics / reporting pasca-acara.

---

*Tick PRD v1.0 · Disusun Mei 2026*