# Design: Fix Tailwind CSS Rendering & Design Token Pipeline

## Context

The site view in the browser currently lacks styling and design tokens because `src/app/globals.css` is missing all `:root` and `.dark` CSS custom properties, and `@tailwindcss/postcss` with Tailwind v4 requires either `@import "tailwindcss";` or `@config` linkage to parse `tailwind.config.js`. See `proposal.md` for background motivation.

## Goals / Non-Goals

**Goals:**
- Supply the complete HSL design token palette (`:root` and `.dark`) in `src/app/globals.css` per `docs/frontend/01-design-system.md`.
- Establish the correct Tailwind CSS entry directives and PostCSS configuration so utility classes (`bg-card`, `text-primary`, `border-border`, etc.) compile into the production and development CSS bundles.
- Verify that compiled CSS bundles in `.next/` contain both the custom properties and the active utility class declarations.

**Non-Goals:**
- Modifying React component structure or application business logic.
- Changing color values or redesigning tokens outside of the authoritative design system specification.

## Decisions

### Decision 1: Tailwind v4 PostCSS Integration & Config Binding
- **Choice**: In `src/app/globals.css`, declare `@import "tailwindcss";` with `@config "../../tailwind.config.js";` (or `@config "../../../tailwind.config.js";` based on relative path to root `tailwind.config.js`), and define the `@layer base` CSS custom properties.
- **Rationale**: Tailwind v4 uses `@import "tailwindcss";` as its primary entry point. When paired with `@config`, it honors the existing `tailwind.config.js` content paths and theme extensions while compiling through `@tailwindcss/postcss`.
- **Alternatives Considered**: Downgrading to Tailwind v3 (unnecessary if v4 PostCSS plugin is configured properly with `@config`).

### Decision 2: Explicit HSL Variable Values
- **Choice**: Embed all `:root` and `.dark` variables for semantic surfaces, foregrounds, borders, radii, and deployment status states directly in `src/app/globals.css`.
- **Rationale**: Components throughout the application depend on `hsl(var(--background))`, `hsl(var(--card))`, `hsl(var(--primary))`, etc. Defining these custom properties directly ensures both light and dark modes evaluate correctly upon page load.

## Risks / Trade-offs

- **[Relative Config Path Resolution]** → In Next.js, the path from `src/app/globals.css` to project root `tailwind.config.js` is `../../tailwind.config.js`. Mitigation: Verify build succeeds and inspect generated CSS output.
