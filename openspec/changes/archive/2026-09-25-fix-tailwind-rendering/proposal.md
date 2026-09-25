# Proposal: Fix Tailwind CSS Rendering & Design Token Pipeline

## Why

The browser currently renders unstyled or broken HTML because the global stylesheet (`src/app/globals.css`) is missing all semantic CSS custom properties (`--background`, `--foreground`, `--primary`, `--card`, `--border`, status tokens), and is using deprecated Tailwind v3 directives (`@tailwind base; @tailwind components; @tailwind utilities;`) with Tailwind CSS v4 and `@tailwindcss/postcss`. As a result, CSS utility classes and design tokens fail to generate or evaluate properly in the browser.

## What Changes

- **Restore and Configure Tailwind Directives in `src/app/globals.css`**: Update CSS entry to use Tailwind v4 `@import "tailwindcss";` and bind project configuration (`@config "../../tailwind.config.js";`), ensuring all utility classes (`bg-card`, `text-primary`, `flex`, `grid`, etc.) are compiled.
- **Restore Complete HSL Design Token Palette**: Re-add full `:root` and `.dark` CSS variable blocks for surfaces, text, borders, radii, and deployment status indicators (`--status-queued`, `--status-building`, etc.) per `docs/frontend/01-design-system.md`.
- **PostCSS & Build Pipeline Verification**: Verify PostCSS plugin configuration with `@tailwindcss/postcss` and ensure Next.js build and dev environments generate the complete CSS bundle with active classes.

## Capabilities

### New Capabilities
<!-- None: This change fixes existing theme and token styling infrastructure. -->

### Modified Capabilities
- `foundations-theme`: Update the implementation and requirements of the design token and stylesheet pipeline so that Tailwind CSS v4 directives and HSL custom properties generate full styles in both production and development browser environments.

## Impact

- **Affected Files**: `src/app/globals.css`, `postcss.config.js`, `tailwind.config.js`.
- **User Impact**: All pages (dashboard, login, register, sidebar, topbar, cards, badges) will render with their designed dark/light themes, typography, borders, and layout metrics in the browser.
