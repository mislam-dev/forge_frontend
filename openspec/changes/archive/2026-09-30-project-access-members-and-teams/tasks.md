# Tasks

## 1. Schema & Hooks Preparation

- [x] 1.1 Add `projectMemberAssignSchema` and `projectTeamAssignSchema` to `src/lib/validation/projects.ts` supporting distinct role options (`admin`, `developer`, `viewer` for members; `developer`, `viewer` for teams) and verify TypeScript types export cleanly.
- [x] 1.2 Verify and refine `useProjectMembers`, `useAssignProjectMember`, `useRemoveProjectMember`, `useProjectTeams`, `useAssignProjectTeam`, and `useRemoveProjectTeam` in `src/lib/hooks/api/useProjectAccess.ts` to ensure precise payload handling and targeted query invalidations.

## 2. Workspace-Aware Access Page Implementation

- [x] 2.1 Update `src/app/(dashboard)/projects/[id]/access/page.tsx` to read `activeOrgId` from `useWorkspaceStore` and conditionally control team queries (`enabled: Boolean(activeOrgId)`).
- [x] 2.2 Implement personal workspace view in `page.tsx`: when `activeOrgId === null`, render direct project members management exclusively using `/projects/{id}/members` APIs, completely hiding team tabs, modals, and buttons.
- [x] 2.3 Implement organization workspace view in `page.tsx`: when `activeOrgId !== null`, render a tabbed interface ("Collaborators" and "Assigned Teams"), integrating the 3 team assignment APIs (`GET`, `POST`, `DELETE /api/v1/projects/:id/teams`) with a team selector dropdown backed by `useTeamsList(activeOrgId)`.

## 3. Verification & Build

- [x] 3.1 Run TypeScript type checking (`pnpm tsc --noEmit`) to verify zero type errors.
- [x] 3.2 Run frontend production build (`pnpm build`) to verify clean compilation.
