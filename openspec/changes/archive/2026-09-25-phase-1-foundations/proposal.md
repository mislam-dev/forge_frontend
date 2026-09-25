# Proposal

## Why

The Forge Platform repository currently has technical documentation and phased blueprints, but no executable frontend code. Phase 1 lays the foundational bedrock of the web dashboard by bootstrapping Next.js 16 App Router, establishing Tailwind CSS HSL design tokens, setting up the dark/light theme engine, configuring client state persistence with Zustand, and validating the initial production build.

## What Changes

- Initialize `package.json` with dependencies (Next.js 16, React 19, Tailwind CSS, Lucide icons, Zustand, next-themes, Axios, Zod).
- Configure TypeScript compiler (`tsconfig.json`) and PostCSS (`postcss.config.js`).
- Define HSL CSS variables for light/dark themes and all 6 status colors (`--status-queued`, `--status-building`, `--status-deploying`, `--status-running`, `--status-success`, `--status-failed`) in `app/globals.css`.
- Configure `tailwind.config.js` with semantic color mappings, typography, container metrics, and animations.
- Create `lib/utils.ts` with the standard `cn()` class merger.
- Implement `components/providers/ThemeProvider.tsx` wrapping `next-themes`.
- Implement `lib/store/useWorkspaceStore.ts` using Zustand with `localStorage` persistence for active organization and sidebar collapse state.
- Create base root layout (`app/layout.tsx`) and starter health check view (`app/page.tsx`).
- Configure environment variables template (`.env.local`).

## Capabilities

### New Capabilities
- `foundations-theme`: Core design token system, CSS variables for light and dark modes, status semantics, client persistence store, and Next.js 16 App Router root layout.

### Modified Capabilities
<!-- None -->

## Impact

- **Codebase**: Bootstraps the root application codebase from a greenfield state into a compilable, lintable Next.js 16 project.
- **Package Manager**: Uses pnpm (v10) instead of npm for faster, deterministic installs.
- **Dependencies**: Adds core pnpm packages aligned with Next.js 16 and React 19.
- **Downstream Phases**: Unlocks Phase 2 (Reusable Components & API Transport) and Phase 3 (Layout Shell & Routing).
