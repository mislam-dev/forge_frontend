# Proposal

## Why

The backend Rust service strictly models team roles via `TeamRole`: `Viewer = 1 ("viewer")`, `Developer = 2 ("developer")`, and `Admin = 3 ("admin")`. The frontend previously exposed extraneous role options (`lead`, `maintainer`, `member`) and defaulted to `"member"`, which does not exist in the backend schema and can cause payload rejection. The frontend types, Zod validation schemas, and UI components must be standardized to restrict team member roles strictly to `viewer`, `developer`, and `admin`.

## What Changes

- Define `TeamRole` type union (`'viewer' | 'developer' | 'admin'`) in `src/lib/api/types.ts` and apply it to `AddTeamMemberDTO`, `UpdateTeamMemberRoleRequest`, and `TeamMemberDTO`.
- Update `addTeamMemberSchema` in `src/lib/validation/teams.ts` to strictly validate `role` against `['viewer', 'developer', 'admin']`.
- Update `SUPPORTED_ROLES` in `src/components/teams/TeamMembersManager.tsx` to strictly include `viewer`, `developer`, and `admin`.
- Update the default form role to `'developer'` and update the `<select>` options in both the add member form and the member roster role selector.

## Capabilities

### Modified Capabilities
- `domain-modules`: Update requirement `Global and Organization Teams Management` to specify that team member roles are strictly restricted to `viewer`, `developer`, and `admin`.

## Impact

- `src/lib/api/types.ts`: `TeamRole` type and associated request/response DTOs.
- `src/lib/validation/teams.ts`: `addTeamMemberSchema`.
- `src/components/teams/TeamMembersManager.tsx`: `SUPPORTED_ROLES`, default form values, and role options.
