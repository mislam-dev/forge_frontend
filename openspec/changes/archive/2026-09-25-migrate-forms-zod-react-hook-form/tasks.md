# Tasks

## 1. Domain Validation Schemas

- [x] 1.1 Create `src/lib/validation/projects.ts` defining `projectStep1Schema`, `projectStep2Schema`, `projectRepoSettingsSchema`, and `projectAccessAssignSchema`, and verify types with `npx tsc --noEmit`
- [x] 1.2 Create `src/lib/validation/organizations.ts` defining `createOrgSchema` and `inviteMemberSchema`, and verify types with `npx tsc --noEmit`
- [x] 1.3 Create `src/lib/validation/teams.ts` defining `createTeamSchema` and `addTeamMemberSchema`, and verify types with `npx tsc --noEmit`
- [x] 1.4 Create `src/lib/validation/settings.ts` defining `profileSettingsSchema` and `securityPasswordSchema` (with password match refinement), and verify types with `npx tsc --noEmit`

## 2. Project Forms Migration

- [x] 2.1 Refactor Project Creation Wizard (`src/app/(dashboard)/projects/new/page.tsx`) to React Hook Form with Zod schemas for Step 1 and Step 2, removing native HTML validation attributes and rendering `<FormMessage />`
- [x] 2.2 Refactor Project Repository Settings (`src/app/(dashboard)/projects/[id]/repository/page.tsx`) to React Hook Form and Zod, replacing native validation with inline `<FormMessage />`
- [x] 2.3 Refactor Project Role Assignment Dialog (`src/app/(dashboard)/projects/[id]/access/page.tsx`) to React Hook Form and Zod, rendering inline error messages for missing targets

## 3. Organization & Team Forms Migration

- [x] 3.1 Refactor Create Organization Dialog (`src/app/(dashboard)/organizations/page.tsx`) to React Hook Form and Zod with inline error messaging
- [x] 3.2 Refactor Invite Member Dialog (`src/app/(dashboard)/organizations/[id]/members/page.tsx`) to React Hook Form and Zod with inline email format errors
- [x] 3.3 Refactor Create Team Dialogs across Global Teams (`src/app/(dashboard)/teams/page.tsx`) and Organization Teams (`src/app/(dashboard)/organizations/[id]/teams/page.tsx`) to React Hook Form and Zod
- [x] 3.4 Refactor Add Member form in `src/components/teams/TeamMembersDialog.tsx` to React Hook Form and Zod with inline field validation

## 4. User Settings Forms Migration

- [x] 4.1 Refactor Profile Settings form (`src/app/(dashboard)/settings/page.tsx`) to React Hook Form and Zod with inline validation messages
- [x] 4.2 Refactor Change Password form (`src/app/(dashboard)/settings/security/page.tsx`) to React Hook Form and Zod with inline password confirmation validation

## 5. Verification & Build

- [x] 5.1 Run full TypeScript verification with `npx tsc --noEmit` and verify zero errors
- [x] 5.2 Run Next.js production build with `pnpm exec next build --webpack` and verify clean build output
