# Tasks

## 1. Custom React Query Hooks & API Types

- [x] 1.1 Expand `src/lib/api/types.ts` with complete DTOs for metrics, projects, env vars, deployments, organizations, teams, notifications, and user profiles per `05-module-specs.md` and verify type validity with `npx tsc --noEmit`
- [x] 1.2 Implement `src/lib/hooks/api/useDashboard.ts` for aggregate metrics and system health with query invalidation
- [x] 1.3 Implement `src/lib/hooks/api/useProjects.ts` and `src/lib/hooks/api/useProjectRepo.ts` for project listing, wizard creation, details, and git repo settings
- [x] 1.4 Implement `src/lib/hooks/api/useEnvVars.ts` for fetching and saving project environment variables
- [x] 1.5 Implement `src/lib/hooks/api/useDeployments.ts` for paginated deployment history, detail queries, and trigger/cancel mutations
- [x] 1.6 Implement `src/lib/hooks/api/useOrganizations.ts` and `src/lib/hooks/api/useTeams.ts` for tenant management, member invitations, and team operations
- [x] 1.7 Implement `src/lib/hooks/api/useNotifications.ts` and `src/lib/hooks/api/useUserProfile.ts` for notification feed actions and profile/security mutations

## 2. Offline Mock Data Provider & Fallback Layer

- [x] 2.1 Implement realistic seed data in `src/lib/api/mock/seeds.ts` for all 10 domain entities matching OpenAPI schemas
- [x] 2.2 Implement mock HTTP request interceptor in `src/lib/api/mock/adapter.ts` and wire automatic network fallback into `src/lib/api/client.ts`
- [x] 2.3 Implement simulated SSE build log stream generator for deployment logs when backend is offline or mock mode is active

## 3. Overview Dashboard View

- [x] 3.1 Implement metrics cards, health indicator, quick action shortcuts, and recent deployments feed in `src/app/(dashboard)/dashboard/page.tsx`
- [x] 3.2 Verify dashboard metrics render cleanly with mock data and responsive grid layout

## 4. Projects Module & Creation Wizard

- [x] 4.1 Implement projects listing page with search, runtime filter, and pagination in `src/app/(dashboard)/projects/page.tsx`
- [x] 4.2 Implement 3-step project creation wizard with step validation in `src/app/(dashboard)/projects/new/page.tsx`
- [x] 4.3 Implement project overview details page with summary status card in `src/app/(dashboard)/projects/[id]/page.tsx`
- [x] 4.4 Implement git repository & PAT credentials settings page in `src/app/(dashboard)/projects/[id]/repository/page.tsx`

## 5. Environment Variables Editor

- [x] 5.1 Implement POSIX key validation regex, environment scope selector, and `EncryptedValueMasker` integration in `src/app/(dashboard)/projects/[id]/env-vars/page.tsx`
- [x] 5.2 Implement bulk `.env` paste dialog with multiline parsing and error highlighting

## 6. Deployments History & Live Build Console

- [x] 6.1 Implement deployment history list with status badges and filters in `src/app/(dashboard)/projects/[id]/deployments/page.tsx`
- [x] 6.2 Implement real-time deployment build console in `src/app/(dashboard)/projects/[id]/deployments/[depId]/page.tsx` integrating `SseLogViewer` with ANSI formatting, autoscroll, fullscreen, and redeploy/cancel actions

## 7. Project Access & Role Assignment

- [x] 7.1 Implement project team/member access table and role assignment modal (`Admin`, `Member`, `Viewer`) in `src/app/(dashboard)/projects/[id]/access/page.tsx`

## 8. Organizations & Teams Management

- [x] 8.1 Implement organizations list and creation dialog in `src/app/(dashboard)/organizations/page.tsx`
- [x] 8.2 Implement organization detail, member invite modal, and team management under `src/app/(dashboard)/organizations/[id]/page.tsx`, `members/page.tsx`, and `teams/page.tsx`
- [x] 8.3 Implement global teams directory and team creation modal in `src/app/(dashboard)/teams/page.tsx`

## 9. Notifications Feed

- [x] 9.1 Implement notifications list with severity filters, unread badge, and mark-all-as-read in `src/app/(dashboard)/notifications/page.tsx`

## 10. User Profile & Security Settings

- [x] 10.1 Implement user profile edit form (display name, email, avatar URL) in `src/app/(dashboard)/settings/page.tsx`
- [x] 10.2 Implement password change form, MFA status display, and active session manager in `src/app/(dashboard)/settings/security/page.tsx`

## 11. Verification & Build Integrity

- [x] 11.1 Run full project TypeScript check with `npx tsc --noEmit` and verify zero errors
- [x] 11.2 Run Next.js production build with `pnpm exec next build --webpack` and verify all routes compile cleanly
