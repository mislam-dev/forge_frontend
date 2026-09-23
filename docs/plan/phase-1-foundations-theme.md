# Phase 1 Implementation Plan: Foundations, Tooling & Design System Tokens

> **Phase:** 1 of 4  
> **Target:** Project Scaffolding, Design Tokens, Theme Engine & Client Stores  
> **Source Documents:** [`docs/frontend/01-design-system.md`](../frontend/01-design-system.md) & [`docs/frontend/06-project-setup-and-tooling.md`](../frontend/06-project-setup-and-tooling.md)  
> **Status:** Ready for Implementation  

---

## 1. Overview & Objectives

Phase 1 establishes the operational core of the Forge Platform web application. Completing this phase results in a buildable Next.js 14 App Router project with configured Tailwind tokens, dark/light theme switching, Zustand client persistence, and baseline environment configuration.

---

## 2. File Manifest

| Target File | Purpose | Authoritative Source |
|---|---|---|
| `.env.local` | Platform backend URLs and metadata | `06-project-setup-and-tooling.md § 1` |
| `package.json` | Project dependencies, scripts, and dev tools | `06-project-setup-and-tooling.md § 2` |
| `tsconfig.json` | TypeScript 5.x compiler configuration & `@/*` path alias | Baseline App Router config |
| `tailwind.config.js` | Tailwind theme extensions, HSL color tokens, animations | `01-design-system.md § 3` |
| `postcss.config.js` | PostCSS config for Tailwind and Autoprefixer | Baseline Tailwind setup |
| `app/globals.css` | HSL CSS variables for `:root`, `.dark`, and status colors | `01-design-system.md § 2.1` |
| `lib/utils.ts` | `cn()` helper merging `clsx` and `tailwind-merge` | `01-design-system.md § 1` |
| `components/providers/ThemeProvider.tsx` | Next-themes wrapper (`attribute="class"`, `defaultTheme="dark"`) | `01-design-system.md § 2` |
| `lib/store/useWorkspaceStore.ts` | Zustand store for active organization & sidebar state | `06-project-setup-and-tooling.md § 5.1` |
| `app/layout.tsx` | Root layout configuring fonts and theme providers | `03-pages-and-routes.md § 1` |
| `app/page.tsx` | Root landing redirect or starter smoke check | Baseline route |

---

## 3. Step-by-Step Implementation Guide

### Step 1.1: Environment Variables Configuration (`.env.local`)
Create `.env.local` in the project root:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME="Forge Platform"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NEXT_PUBLIC_SSE_LOG_URL=http://localhost:8080
```

### Step 1.2: Package Manifest & Installation
Create `package.json` with the exact dependencies from `docs/frontend/06-project-setup-and-tooling.md`:
```json
{
  "name": "forge-dashboard",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.4",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-select": "^1.2.2",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@tanstack/react-query": "^5.28.9",
    "@tanstack/react-table": "^8.15.0",
    "axios": "^1.6.8",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.359.0",
    "next": "14.1.4",
    "next-themes": "^0.3.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.51.2",
    "tailwind-merge": "^2.2.2",
    "tailwindcss-animate": "^1.0.7",
    "uuid": "^9.0.1",
    "zod": "^3.22.4",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@types/node": "^20.11.30",
    "@types/react": "^18.2.69",
    "@types/react-dom": "^18.2.22",
    "@types/uuid": "^9.0.8",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.4.3"
  }
}
```
*Note for Node 24*: Run `npm install --legacy-peer-deps` to ensure clean dependency resolution across React 18 primitives.

### Step 1.3: CSS Tokens & Theme Styles (`app/globals.css`)
Configure `app/globals.css` with the complete HSL tokens from `docs/frontend/01-design-system.md § 2.1`:
- Base semantic tokens (`--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--radius`).
- Status tokens for both light and dark modes:
  - `--status-queued`
  - `--status-building`
  - `--status-deploying`
  - `--status-running`
  - `--status-success`
  - `--status-failed`

### Step 1.4: Tailwind Configuration (`tailwind.config.js`)
Extend Tailwind colors with the HSL CSS variable references, container configuration (`max-w: 1400px`), and `tailwindcss-animate` plugin as specified in `docs/frontend/01-design-system.md § 3`.

### Step 1.5: Utility & Providers Setup
1. **`lib/utils.ts`**:
   ```typescript
   import { type ClassValue, clsx } from "clsx";
   import { twMerge } from "tailwind-merge";

   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs));
   }
   ```
2. **`components/providers/ThemeProvider.tsx`**:
   ```tsx
   "use client";

   import * as React from "react";
   import { ThemeProvider as NextThemesProvider } from "next-themes";
   import type { ThemeProviderProps } from "next-themes/dist/types";

   export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
     return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
   }
   ```
3. **`lib/store/useWorkspaceStore.ts`**:
   Implement the persistent Zustand workspace store as specified in `docs/frontend/06-project-setup-and-tooling.md § 5.1`.

### Step 1.6: Root Layout Setup (`app/layout.tsx`)
Construct the root layout assembling `ThemeProvider` (with `attribute="class"`, `defaultTheme="dark"`, `enableSystem`), font variables (`Inter` and `JetBrains Mono`), and metadata headers.

---

## 4. Phase 1 Verification & Acceptance Criteria

Execute the following commands to confirm completion:

```bash
# 1. Verify dependencies install cleanly
npm install --legacy-peer-deps

# 2. Verify TypeScript type checking & Next.js production build
npm run build

# 3. Verify local development server boots
npm run dev
```

### Exit Checklist
- [ ] Next.js 14 compiles without TypeScript or lint errors.
- [ ] `globals.css` declares all 6 status color tokens for light and dark modes.
- [ ] Theme switching alters the `class="dark"` attribute on the `<html>` root.
- [ ] `useWorkspaceStore` persists active organization ID and sidebar state in `localStorage`.
