# Design

## Context

See `proposal.md` for motivation and `specs/domain-modules/spec.md` for behavioral requirements. Currently, dashboard forms use unmanaged React state with native HTML attributes (`required`, `minLength`, `type="email"`) which trigger browser-specific validation bubbles and lack consistent inline feedback. Authentication forms already follow the design pattern of React Hook Form + Zod resolvers + `@/components/ui/form` primitives.

## Goals / Non-Goals

**Goals:**
- Create modular Zod validation schemas in `src/lib/validation/` for all dashboard domains: projects, repository settings, access assignment, organizations, teams, team members, and user settings.
- Refactor all dashboard forms to use `react-hook-form` with `@hookform/resolvers/zod`.
- Strip all browser-native constraint validation attributes (`required`, `minLength`, native tooltips) and add `noValidate` to form tags.
- Render styled inline `<FormMessage />` error messages beneath every field using semantic destructive tokens.
- Maintain seamless integration with TanStack Query mutations and existing backend/mock API payload shapes.

**Non-Goals:**
- Modifying authentication forms (already using React Hook Form + Zod).
- Altering backend API contracts or DTOs.
- Introducing multi-page routing changes for modals.

## Decisions

### Decision 1: Modular Zod Schema Directory (`src/lib/validation/`)
- **Approach**: Group schemas by domain area:
  - `src/lib/validation/projects.ts`: Wizard step 1 (`name`, `runtime`, `project_type`, `description`), step 2 (`repository_url`, `branch`, `pat_token`), repository settings, and access role assignment.
  - `src/lib/validation/organizations.ts`: Organization creation and member invitation schemas.
  - `src/lib/validation/teams.ts`: Team creation and team member assignment schemas.
  - `src/lib/validation/settings.ts`: Profile information and password rotation schemas (with password match refinement).
- **Rationale**: Isolating validation schemas from UI components provides single-source-of-truth validation, makes unit testing straightforward, and matches existing auth validation structure.
- **Alternatives Considered**: Defining inline schemas inside each page component. Rejected due to code bloat and difficulty reusing schemas across similar dialogs (e.g. global teams vs organization teams).

### Decision 2: `@/components/ui/form` Primitives Over Generic Wrappers for Modals
- **Approach**: Use `<Form {...form}><form noValidate onSubmit={form.handleSubmit(onSubmit)}>` alongside `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, and `<FormMessage>`.
- **Rationale**: The Radix-based `@/components/ui/form` components handle `id`, `aria-describedby`, `aria-invalid`, and error message rendering out-of-the-box, ensuring high accessibility and visual consistency across modals and full-page wizards.
- **Alternatives Considered**: Manual error state management using `formState.errors[field]?.message`. Rejected because `@/components/ui/form` already encapsulates accessible labeling and error associations.

### Decision 3: Disabling Native Browser Validation
- **Approach**: Explicitly add `noValidate` to all `<form>` tags and remove HTML attributes like `required` and `minLength` from input elements.
- **Rationale**: Browser-native popups block form submission with non-stylable, OS-dependent tooltips. `noValidate` guarantees that Zod and React Hook Form have exclusive control over validation and messaging.

## Risks / Trade-offs

- **[Risk] Pre-filled forms with asynchronous query data (e.g. Profile or Repository Settings)**:
  → *Mitigation*: Use React Hook Form's `values` prop or call `form.reset(data)` in a `useEffect` when TanStack Query finishes loading.
- **[Risk] Modal re-opening with stale validation errors**:
  → *Mitigation*: Call `form.reset()` whenever dialog `isOpen` flips to `false` or upon successful mutation.
