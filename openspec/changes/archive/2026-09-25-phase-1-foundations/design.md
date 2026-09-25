# Design: Phase 1 Foundations & Theme

## Context

See `proposal.md` for motivation and [`docs/plan/phase-1-foundations-theme.md`](../../../docs/plan/phase-1-foundations-theme.md) for the phased roadmap. The goal is to initialize the project from an empty directory into a functional Next.js 16 application equipped with Tailwind CSS tokens, theme management, and client state persistence.

## Goals / Non-Goals

**Goals:**
- Create a runnable Next.js 16 App Router project with TypeScript 5.x.
- Install exact required dependencies using pnpm.
- Implement all HSL tokens from `docs/frontend/01-design-system.md` in `app/globals.css`.
- Map tokens into `tailwind.config.js` including status colors, radius, and fonts.
- Implement `ThemeProvider` (`next-themes`) and `useWorkspaceStore` (`zustand/middleware/persist`).
- Verify `pnpm build` compiles with zero errors.

**Non-Goals:**
- Creating reusable UI components (Buttons, Modals, DataTables, SSE viewers) — deferred to Phase 2.
- Creating authentication forms or dashboard shells — deferred to Phase 3.
- Implementing domain API data fetching — deferred to Phase 4.

## Decisions

### Decision 1: Dependency Management with pnpm
- **Choice**: Use `package.json` with Next.js 16 (latest stable), React 19, and pnpm (v10) as the package manager.
- **Rationale**: Next.js 16 is the current stable release. pnpm provides faster installs, strict dependency isolation, and avoids the peer-dependency conflicts that `npm --legacy-peer-deps` would paper over. React 19 is required by Next.js 16.
- **Alternatives Considered**: npm with `--legacy-peer-deps` (rejected per user preference); pinning React 18 (rejected as incompatible with Next.js 16's required peer).

### Decision 2: Zero-Runtime HSL CSS Variable Architecture
- **Choice**: Expose all tokens as raw HSL channel values (`0 0% 100%`) in `app/globals.css` and wrap them with `hsl(var(--...))` in `tailwind.config.js`.
- **Rationale**: Enables Tailwind opacity modifiers (e.g. `bg-amber-500/10`) and ensures instant dark/light switching via CSS class changes on `<html>` without triggering React re-renders.

### Decision 3: Hydration Safe Theme Provider
- **Choice**: Add `suppressHydrationWarning` to the `<html>` element in `app/layout.tsx` and wrap body in `ThemeProvider` with `attribute="class"` and `defaultTheme="dark"`.
- **Rationale**: Prevents React hydration mismatch warnings when `next-themes` reads client local storage and modifies the class list before paint.

## Risks / Trade-offs

- **[Risk] Hydration Warning on Theme Toggle** → *Mitigation*: Add `suppressHydrationWarning` to `<html>` as recommended by `next-themes`.
- **[Risk] Missing Fonts in Offline Environments** → *Mitigation*: Fall back to system sans and monospace fonts in `tailwind.config.js` alongside `Inter` and `JetBrains Mono`.
