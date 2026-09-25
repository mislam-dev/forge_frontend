# foundations-theme Specification

## Purpose
Establishes the base design tokens, CSS variables, theme switching engine, persistent client workspace state, and Next.js 14 App Router layout for the Forge frontend application.

## Requirements

### Requirement: Design Token HSL Variables and Palette
The application styles SHALL define CSS custom properties in HSL format for semantic surfaces, foregrounds, borders, and all six deployment status lifecycle states in both light and dark themes.

#### Scenario: Dark theme token evaluation
- **WHEN** the document root element is assigned class `dark`
- **THEN** theme variables (`--background`, `--card`, `--primary`, `--status-*`) evaluate to high-contrast dark mode HSL values

### Requirement: Client Theme Switching Provider
The application SHALL provide a theme provider wrapper utilizing `next-themes` configured with `attribute="class"` and `defaultTheme="dark"` that renders without React hydration mismatches.

#### Scenario: Client hydration theme resolution
- **WHEN** the user loads any page in the browser
- **THEN** the theme provider applies the persisted or system theme class to `document.documentElement`

### Requirement: Workspace Preferences State Persistence
The client application SHALL persist active organization context (`activeOrgId`, `activeOrgName`) and sidebar collapsed state (`isSidebarCollapsed`) in `localStorage` across page reloads.

#### Scenario: Workspace preferences persistence
- **WHEN** a user selects an active organization or toggles the sidebar
- **THEN** the change is written to `localStorage` under `forge_workspace_preferences` and reloaded on subsequent visits

### Requirement: App Router Build & Baseline Route Layout
The application SHALL provide a Next.js 14 App Router root layout that imports global stylesheets, establishes typography font classes, wraps children in theme providers, and builds cleanly via Next.js compiler.

#### Scenario: Production build compilation
- **WHEN** `npm run build` is invoked
- **THEN** the Next.js compiler builds the application without TypeScript, ESLint, or runtime layout errors
