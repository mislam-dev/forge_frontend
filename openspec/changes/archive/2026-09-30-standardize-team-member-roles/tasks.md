# Tasks

## 1. Type Definitions & Validation

- [x] 1.1 Define `TeamRole` union type (`'viewer' | 'developer' | 'admin'`) and `TEAM_ROLES` in `src/lib/api/types.ts`, and update `AddTeamMemberDTO`, `UpdateTeamMemberRoleRequest`, and `TeamMemberDTO`.
- [x] 1.2 Update `addTeamMemberSchema` in `src/lib/validation/teams.ts` to strictly validate `role` with `z.enum(['viewer', 'developer', 'admin'])`.

## 2. Team Member Management UI

- [x] 2.1 Update `SUPPORTED_ROLES` in `src/components/teams/TeamMembersManager.tsx` to `['viewer', 'developer', 'admin']` and default the form role to `'developer'`.
- [x] 2.2 Update role selection dropdowns in both the "Add New Member" form and the member roster row to offer only the standardized roles (`Viewer`, `Developer`, `Admin`).
- [x] 2.3 Verify role badge variant styling for `viewer`, `developer`, and `admin`.

## 3. Verification & Build

- [x] 3.1 Run `pnpm tsc --noEmit` to verify type safety across schemas, hooks, and components.
- [x] 3.2 Run `pnpm build` to verify clean production build.
