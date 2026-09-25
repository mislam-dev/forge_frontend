# Tasks

## 1. PostCSS & Tailwind v4 Directive Configuration

- [x] 1.1 Update `src/app/globals.css` to use `@import "tailwindcss";` and `@config "../../tailwind.config.js";` compatible with `@tailwindcss/postcss`. Verify clean CSS parsing.
- [x] 1.2 Verify `postcss.config.js` correctly registers `@tailwindcss/postcss` and `autoprefixer`.

## 2. HSL Design Token Palette Restoration

- [x] 2.1 Re-add the complete `:root` CSS custom properties (`--background`, `--foreground`, `--card`, `--primary`, `--border`, `--radius`, `--status-*`) in `src/app/globals.css`.
- [x] 2.2 Re-add the complete `.dark` CSS custom properties with dark mode HSL values in `src/app/globals.css`.

## 3. Build & Style Verification

- [x] 3.1 Execute `pnpm exec next build --webpack` and verify that production compilation succeeds with exit code 0.
- [x] 3.2 Inspect generated CSS output in `.next/static/css/` to confirm that utility classes (`.bg-background`, `.bg-card`, `.text-primary`, `.border-border`) and CSS variables are actively generated in the compiled bundle.
