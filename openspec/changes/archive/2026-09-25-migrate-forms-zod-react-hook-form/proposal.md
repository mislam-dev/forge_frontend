# Proposal

## Why

Currently, forms across the application dashboard (including project creation steps, repository settings, project access assignment, organization/team creation modals, team member management, profile settings, and password updates) rely on native HTML form validation attributes (such as `required`, `minLength`, and browser-default constraint validation) without standardized inline error messages. This produces inconsistent browser-dependent validation popups, poor accessibility, and an inferior user experience compared to the auth flows which already use React Hook Form and Zod schemas.

Migrating these forms to React Hook Form and Zod schemas removes browser-native validation tooltips, unifies form validation architecture across the entire project, and provides immediate, accessible, and styled inline validation messages beneath each invalid field.

## What Changes

- Add Zod validation schemas for all dashboard forms:
  - Project Creation Wizard (Step 1: Project Details, Step 2: Git Repository)
  - Project Repository Settings form
  - Project Access Role Assignment dialog
  - Create Organization dialog
  - Organization Member Invitation dialog
  - Create Team dialog (Global and Organization)
  - Team Members Dialog (Add Member form)
  - Profile Settings form
  - Security Settings (Change Password form)
- Refactor all corresponding form components to use `useForm` from `react-hook-form` with `@hookform/resolvers/zod`.
- Remove native HTML validation constraints (`required`, `minLength`, native browser popups) and add `noValidate` to form elements.
- Integrate `@/components/ui/form` (`Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`) or direct inline error messages with accessible `aria-invalid` and `aria-describedby` wiring.
- Standardize error message presentation with red error text and border highlighting on invalid fields.

## Capabilities

### New Capabilities
*(None)*

### Modified Capabilities
- `domain-modules`: Update form requirements across project wizards, repository configuration, access role assignment, organization creation/invitation, team creation/member rosters, and user profile/security to enforce validation via Zod schemas and React Hook Form with clear inline error messages, replacing native browser validation.

## Impact

- **Affected Code**:
  - `src/app/(dashboard)/projects/new/page.tsx`
  - `src/app/(dashboard)/projects/[id]/repository/page.tsx`
  - `src/app/(dashboard)/projects/[id]/access/page.tsx`
  - `src/app/(dashboard)/organizations/page.tsx`
  - `src/app/(dashboard)/organizations/[id]/members/page.tsx`
  - `src/app/(dashboard)/organizations/[id]/teams/page.tsx`
  - `src/app/(dashboard)/teams/page.tsx`
  - `src/components/teams/TeamMembersDialog.tsx`
  - `src/app/(dashboard)/settings/page.tsx`
  - `src/app/(dashboard)/settings/security/page.tsx`
  - New or updated validation schemas in `src/lib/validation/` (e.g., `projects.ts`, `organizations.ts`, `teams.ts`, `settings.ts`)
- **Dependencies**: Uses existing dependencies `@hookform/resolvers`, `react-hook-form`, and `zod`. No new dependencies required.
- **Breaking Changes**: None. APIs and submission payloads remain identical.
