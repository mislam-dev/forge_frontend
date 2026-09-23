# Frontend Design System & Theme Specification

> **Document:** Design System & Theme Specification  
> **Version:** 1.0.0  
> **Target Framework:** Next.js App Router · Tailwind CSS · shadcn/ui  
> **Scope:** Color tokens, typography, CSS variables, dark/light themes, status colors, and layout metrics  

---

## 1. Design System Overview

The Forge Platform UI adopts a **clean, modern, developer-first engineering aesthetic** (inspired by Vercel, Linear, and Railway). It features high contrast, crisp typography, subtle borders, dark-mode-first prioritization, and explicit visual hierarchy for deployment states and cloud infrastructure metrics.

---

## 2. Color Palette & CSS Variables

The design system is implemented using HSL-based CSS variables integrated into Tailwind CSS. This guarantees seamless theme toggling via `next-themes`.

### 2.1 CSS Variables (`app/globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 224 71.4% 4.1%;

    --card: 0 0% 100%;
    --card-foreground: 224 71.4% 4.1%;

    --popover: 0 0% 100%;
    --popover-foreground: 224 71.4% 4.1%;

    --primary: 220.9 83.2% 53.3%;
    --primary-foreground: 210 20% 98%;

    --secondary: 220 14.3% 95.9%;
    --secondary-foreground: 220.9 39.3% 11%;

    --muted: 220 14.3% 95.9%;
    --muted-foreground: 220 8.9% 46.1%;

    --accent: 220 14.3% 95.9%;
    --accent-foreground: 220.9 39.3% 11%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 20% 98%;

    --border: 220 13% 91%;
    --input: 220 13% 91%;
    --ring: 224 71.4% 4.1%;

    --radius: 0.5rem;

    /* Status Color Tokens */
    --status-queued: 215 16% 47%;
    --status-building: 45 93% 47%;
    --status-deploying: 217 91% 60%;
    --status-running: 142 71% 45%;
    --status-success: 142 76% 36%;
    --status-failed: 0 84% 60%;
  }

  .dark {
    --background: 224 71.4% 4.1%;
    --foreground: 210 20% 98%;

    --card: 224 71.4% 6%;
    --card-foreground: 210 20% 98%;

    --popover: 224 71.4% 6%;
    --popover-foreground: 210 20% 98%;

    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 20% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 20% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 20% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224 71.4% 4.1%;

    /* Status Color Tokens (Dark Mode Adjusted) */
    --status-queued: 215 20% 65%;
    --status-building: 48 96% 53%;
    --status-deploying: 217 91% 60%;
    --status-running: 142 71% 45%;
    --status-success: 142 76% 45%;
    --status-failed: 0 84% 60%;
  }
}
```

---

## 3. Tailwind Configuration (`tailwind.config.js`)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        status: {
          queued: "hsl(var(--status-queued))",
          building: "hsl(var(--status-building))",
          deploying: "hsl(var(--status-deploying))",
          running: "hsl(var(--status-running))",
          success: "hsl(var(--status-success))",
          failed: "hsl(var(--status-failed))",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

---

## 4. Status Color Semantics & Badges

Deployment lifecycle states require immediate, unambiguous visual recognition across dashboard tables, activity feeds, and detail cards:

| State | Status Token | Background Color | Text Color | Icon | Pulse Animation |
|---|---|---|---|---|---|
| **Queued** | `status.queued` | `bg-slate-500/10` | `text-slate-400` | `<Clock>` | No |
| **Building** | `status.building` | `bg-amber-500/10` | `text-amber-500` | `<Hammer>` | Yes (`animate-spin`) |
| **Deploying** | `status.deploying` | `bg-blue-500/10` | `text-blue-500` | `<Loader2>` | Yes (`animate-spin`) |
| **Running** | `status.running` | `bg-emerald-500/10` | `text-emerald-500` | `<PlayCircle>` | No (Static green glow) |
| **Success** | `status.success` | `bg-emerald-500/10` | `text-emerald-500` | `<CheckCircle2>` | No |
| **Failed** | `status.failed` | `bg-rose-500/10` | `text-rose-500` | `<XCircle>` | No |

---

## 5. Typography Scale & Fonts

- **Primary Sans Font:** `Inter` (UI elements, headers, buttons, cards, table body)
- **Monospace Font:** `JetBrains Mono` or `Fira Code` (Build logs, SHA commits, environment variable values, API endpoints, UUIDs)

| Class | Desktop Size | Mobile Size | Weight | Usage |
|---|---|---|---|---|
| `text-4xl` | 36px | 30px | Bold (700) | Page titles (`Projects`, `Organizations`) |
| `text-2xl` | 24px | 20px | SemiBold (600) | Section titles & Modal headers |
| `text-lg` | 18px | 16px | Medium (500) | Card titles & Form section labels |
| `text-sm` | 14px | 14px | Regular (400) | Body text, Form inputs, Table cells |
| `text-xs` | 12px | 12px | Regular (400) | Micro-copy, Timestamps, Commit SHAs |

---

## 6. Layout Metrics & Grid System

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Topbar Navigation (Height: 64px / h-16)                                 │
├───────────────┬─────────────────────────────────────────────────────────┤
│ Sidebar Nav   │ Main Workspace Content Area                             │
│ (Width: 256px │ (Max Width: 1400px / container)                         │
│  w-64)        │ Padding: 32px (p-8)                                     │
│               │                                                         │
│               │ Grid Spacing: 24px (gap-6)                              │
└───────────────┴─────────────────────────────────────────────────────────┘
```

- **Sidebar Width:** Expanded `256px` (`w-64`), Collapsed `64px` (`w-16`)
- **Header Height:** Fixed `64px` (`h-16`)
- **Card Padding:** `p-6` (Default), `p-4` (Compact)
- **Border Radius:** `rounded-lg` (8px for cards/dialogs), `rounded-md` (6px for buttons/inputs)
