# Proposal

## Why

With Phase 1 (foundations & design system tokens), Phase 2 (UI component library & HTTP/SSE transport client), and Phase 3 (auth flows & dashboard shell layout) complete, Forge requires full implementation of its domain feature modules. Users and teams currently lack concrete management interfaces to create projects, inspect real-time deployment build streams, configure secure environment variables, administer organizations and teams, view notification feeds, and manage profile security settings.

Implementing Phase 4 now delivers the core application value: functional page views backed by TanStack Query hooks, live SSE log streaming, and an offline mock data fallback layer enabling end-to-end local testing without an active Axum backend.

## What Changes

- **React Query Custom Hooks Layer**: Implement dedicated TanStack Query hooks in `src/lib/hooks/api/` covering `useAuth`, `useDashboard`, `useOrganizations`, `useTeams`, `useProjects`, `useEnvVars`, and `useDeployments`.
- **Overview Dashboard View**: Complete `src/app/(dashboard)/dashboard/page.tsx` with live system health indicators, metric overview cards, quick actions, and recent activity feeds.
- **Projects Module**:
  - Project listing and filterable table with search and pagination (`src/app/(dashboard)/projects/page.tsx`).
  - 3-step project creation wizard (`src/app/(dashboard)/projects/new/page.tsx`) with repo linking and environment variable initialization.
  - Project overview details card (`src/app/(dashboard)/projects/[id]/page.tsx`).
  - Git repository & personal access token (PAT) configuration (`src/app/(dashboard)/projects/[id]/repository/page.tsx`).
  - Environment variables manager (`src/app/(dashboard)/projects/[id]/env-vars/page.tsx`) supporting POSIX key validation, bulk `.env` paste, and secret masking via `EncryptedValueMasker`.
  - Project access role assignment table (`src/app/(dashboard)/projects/[id]/access/page.tsx`).
- **Deployments & Build Console**:
  - Deployment history list (`src/app/(dashboard)/projects/[id]/deployments/page.tsx`) with status filtering.
  - Real-time deployment build console (`src/app/(dashboard)/projects/[id]/deployments/[depId]/page.tsx`) integrating `SseLogViewer` and `useSseStream` with autoscroll, ANSI rendering, and redeploy/cancel controls.
- **Organizations & Teams Management**:
  - Organization list and creation (`src/app/(dashboard)/organizations/page.tsx`).
  - Organization detail, member invitation, and role management (`src/app/(dashboard)/organizations/[id]/page.tsx`, `members/page.tsx`, `teams/page.tsx`).
  - Team directory and member management (`src/app/(dashboard)/teams/page.tsx`).
- **Notifications Feed**:
  - In-app notification center (`src/app/(dashboard)/notifications/page.tsx`) with mark-as-read and filtering.
- **Settings & Security**:
  - User profile settings (`src/app/(dashboard)/settings/page.tsx`).
  - Password change, MFA status, and active session manager (`src/app/(dashboard)/settings/security/page.tsx`).
- **Offline Mock Provider & Stream Simulation**:
  - Seed dataset and mock HTTP interceptor in `src/lib/api/mock/` enabled by default when the backend is unreachable or `NEXT_PUBLIC_ENABLE_MOCKS=true`.
  - Simulated SSE build stream generator for deployment logs.

## Capabilities

### New Capabilities
- `domain-modules`: Domain feature modules and interactive page views covering projects, deployments with live SSE build logs, environment variables, organizations, teams, notifications, and user settings backed by React Query hooks and offline mock fallback.

### Modified Capabilities
*(None. Existing capabilities remain unchanged.)*

## Impact

- **Frontend Routes**: Adds full page components under `src/app/(dashboard)/` for `projects`, `organizations`, `teams`, `notifications`, and `settings`.
- **API & Hooks**: Introduces `src/lib/hooks/api/` containing typed hooks communicating through `src/lib/api/client.ts`.
- **Mocks**: Adds `src/lib/api/mock/seeds.ts` and `src/lib/api/mock/adapter.ts` for offline and demo execution.
- **Dependencies**: Uses existing `@tanstack/react-query`, `lucide-react`, `zod`, and UI components with zero new production dependencies required.
