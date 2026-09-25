# Tasks

## 1. Project Scaffolding & Configuration

- [x] 1.1 Create `.env.local`, `package.json` (with Next.js 16, React 19 and current compatible packages), `tsconfig.json`, and `postcss.config.js`. Verify `package.json` contains all core dependencies.
- [x] 1.2 Run `pnpm install` to install project dependencies. Verify installation completes with exit code 0 and `node_modules` is populated.

## 2. Design Tokens & Theme Engine

- [x] 2.1 Author `app/globals.css` with complete HSL CSS variables for light theme, dark theme, and all 6 deployment status states (`queued`, `building`, `deploying`, `running`, `success`, `failed`). Verify variables match `docs/frontend/01-design-system.md § 2.1`.
- [x] 2.2 Author `tailwind.config.js` mapping HSL CSS variables into Tailwind colors, setting container widths (`1400px`), border radii, font families, and `tailwindcss-animate`. Verify syntax parses cleanly.
- [x] 2.3 Implement `lib/utils.ts` (`cn` class merger) and `components/providers/ThemeProvider.tsx` (`next-themes` wrapper with `attribute="class"`). Verify clean TypeScript compilation.

## 3. Client State & Base Layout

- [x] 3.1 Implement `lib/store/useWorkspaceStore.ts` using Zustand with `persist` middleware storing `activeOrgId`, `activeOrgName`, and `isSidebarCollapsed`. Verify store exports expected state and action signatures.
- [x] 3.2 Implement root `app/layout.tsx` (importing `globals.css`, wrapping in `ThemeProvider`, applying `suppressHydrationWarning`) and `app/page.tsx` baseline starter screen. Verify layout structure compiles.

## 4. Verification & Production Build

- [x] 4.1 Execute `pnpm build` and verify that the Next.js production build succeeds with exit code 0 and zero TypeScript or lint errors.
