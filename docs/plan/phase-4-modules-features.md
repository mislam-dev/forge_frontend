# Phase 4 Implementation Plan: Domain Feature Modules & API Integration

> **Phase:** 4 of 4  
> **Target:** 10 Domain Feature Modules, React Query Custom Hooks, SSE Build Console & Mock Fallbacks  
> **Source Documents:** [`docs/frontend/05-module-specs.md`](../frontend/05-module-specs.md), [`docs/frontend/03-pages-and-routes.md`](../frontend/03-pages-and-routes.md), [`docs/frontend/04-api-integration.md`](../frontend/04-api-integration.md)  
> **Status:** Ready for Implementation  

---

## 1. Overview & Objectives

Phase 4 implements the full feature catalog across all domain modules of the Forge Platform. It binds UI components to backend endpoints via TanStack Query custom hooks, delivers real-time build log streaming via Server-Sent Events (SSE), and incorporates an offline mock data provider so the complete application can be tested and demonstrated without an active Axum backend.

---

## 2. File Manifest & Page Routing Map

| Domain Module | Route & Target Page | Custom Query Hook / Component | API Endpoints Bound |
|---|---|---|---|
| **Overview Dashboard** | `app/(dashboard)/page.tsx` | `useDashboardMetrics()`, `MetricsOverviewCards` | `GET /api/v1/dashboard/metrics`, `GET /api/v1/health` |
| **Organizations** | `app/(dashboard)/organizations/page.tsx`<br>`app/(dashboard)/organizations/[id]/page.tsx` | `useOrganizations()`, `useOrgMembers()` | `GET/POST /api/v1/organizations`, `GET /api/v1/organizations/:id` |
| **Org Members & Teams** | `app/(dashboard)/organizations/[id]/members/page.tsx`<br>`app/(dashboard)/organizations/[id]/teams/page.tsx` | `useOrgTeams()`, `InviteMemberModal` | `POST /api/v1/organizations/:id/invitations` |
| **Teams Management** | `app/(dashboard)/teams/page.tsx` | `useTeams()`, `CreateTeamDialog` | `GET/POST /api/v1/teams`, `DELETE /api/v1/teams/:id` |
| **Projects List & Wizard**| `app/(dashboard)/projects/page.tsx`<br>`app/(dashboard)/projects/new/page.tsx` | `useProjects()`, `ProjectWizardForm` | `GET/POST /api/v1/projects` |
| **Project Overview** | `app/(dashboard)/projects/[id]/page.tsx` | `useProjectDetail(id)`, `ProjectStatusCard` | `GET /api/v1/projects/:id` |
| **Git Repository & PAT** | `app/(dashboard)/projects/[id]/repository/page.tsx` | `useProjectRepo()`, `RepoConfigForm` | `PUT /api/v1/projects/:id/repository` |
| **Environment Variables** | `app/(dashboard)/projects/[id]/env-vars/page.tsx` | `useEnvVars(id)`, `EnvVarEditorTable` | `GET/PUT /api/v1/projects/:id/env-vars` |
| **Project Access Roles** | `app/(dashboard)/projects/[id]/access/page.tsx` | `useProjectAccess(id)`, `RoleAssignmentTable`| `GET/PUT /api/v1/projects/:id/access` |
| **Deployments History** | `app/(dashboard)/projects/[id]/deployments/page.tsx` | `useDeployments(id)`, `DeploymentsTable` | `GET /api/v1/projects/:id/deployments` |
| **Live Build Console** | `app/(dashboard)/projects/[id]/deployments/[depId]/page.tsx` | `useDeployment(depId)`, `SseLogViewer` | `GET /api/v1/projects/:id/deployments/:depId`<br>`GET /logs/stream` (SSE) |
| **Notifications Feed** | `app/(dashboard)/notifications/page.tsx` | `useNotifications()`, `NotificationItem` | `GET /api/v1/notifications` |
| **User Profile & Security**| `app/(dashboard)/settings/page.tsx`<br>`app/(dashboard)/settings/security/page.tsx` | `useUserProfile()`, `PasswordChangeForm` | `GET/PATCH /api/v1/users/me`, `POST /password` |

---

## 3. Step-by-Step Implementation Guide

### Step 4.1: Custom React Query Hooks Layer (`lib/hooks/api/`)
Implement query and mutation hooks using `apiClient` and `@tanstack/react-query`:
1. `useAuth.ts`: Login, registration, token refresh, and user sign-out mutations.
2. `useDashboard.ts`: System health check, project/deployment aggregate counters, and recent activity.
3. `useOrganizations.ts`: Fetching user organizations, organization creation, and membership queries.
4. `useTeams.ts`: Team listing, team creation, and member role assignment.
5. `useProjects.ts`:
   - `useProjectsList(orgId?: string)`: Paginated projects list filtered by active organization.
   - `useCreateProject()`: Project creation wizard mutation with repo linking.
   - `useProjectDetail(id: string)`: Real-time project metadata and configuration.
6. `useEnvVars.ts`:
   - `useProjectEnvVars(projectId: string)`: Fetching environment variables.
   - `useSaveEnvVars(projectId: string)`: Upserting encrypted environment key-value pairs.
7. `useDeployments.ts`:
   - `useDeploymentsList(projectId: string, page, pageSize)`: Paginated deployments list.
   - `useTriggerDeployment(projectId: string)`: Mutation to queue a new deployment (`POST /api/v1/projects/:id/deployments`).
   - `useDeploymentDetail(projectId: string, depId: string)`: Polling deployment state until `Running`, `Success`, or `Failed`.

### Step 4.2: Domain Module Views Implementation
1. **Overview Dashboard (`app/(dashboard)/page.tsx`)**:
   - 4-card metric grid: Total Projects, Active Deployments, System Uptime, Organization Count.
   - Quick action shortcuts: "New Project", "Invite Teammate", "Deploy".
   - Recent Deployments activity stream with `StatusBadge`.
2. **Projects Module (`app/(dashboard)/projects/`)**:
   - Filterable projects grid / table with status, Git branch, and last deployed timestamp.
   - Project creation wizard (`new/page.tsx`): 3-step form (Project Name & Runtime -> Git Repo & Branch -> Environment Variables).
3. **Environment Variables Editor (`projects/[id]/env-vars/page.tsx`)**:
   - Interactive table supporting key-value additions, bulk `.env` paste, production/staging scope tags, and `EncryptedValueMasker` for hidden secrets.
4. **Deployment Stream Console (`projects/[id]/deployments/[depId]/page.tsx`)**:
   - Header with commit SHA, author, branch, trigger source, duration timer, and `StatusBadge`.
   - Embeds `SseLogViewer` connected to `NEXT_PUBLIC_SSE_LOG_URL/api/v1/projects/:id/deployments/:depId/logs/stream`.
   - Action controls: "Cancel Deployment", "Redeploy", "Download Logs".
5. **Organizations & Teams Pages (`organizations/` and `teams/`)**:
   - Manage tenant profiles, transfer ownership, invite members with role selection (`Admin`, `Member`, `Viewer`).

### Step 4.3: Offline Mock Data Provider & Fallback Strategy (`lib/api/mock/`)
To allow local testing without requiring an active Axum server running on `http://localhost:8080`:
1. Create `lib/api/mock/seeds.ts` providing realistic mock objects matching `05-module-specs.md` payloads.
2. In `lib/api/client.ts`, configure an optional mock interceptor:
   ```typescript
   // If NEXT_PUBLIC_ENABLE_MOCKS=true or API server is unreachable
   if (process.env.NEXT_PUBLIC_ENABLE_MOCKS === "true") {
     installMockAdapter(apiClient);
   }
   ```
3. Provide mock SSE emitter for the deployment log viewer generating realistic build stream output:
   `"Compiling crates...", "Running migrations...", "Container build successful", "Listening on port 8080"`.

---

## 4. Phase 4 Verification & Acceptance Criteria

Execute the following checks to confirm completion:

```bash
# 1. Typecheck the entire application
npx tsc --noEmit

# 2. Production build verification
npm run build

# 3. Development runtime verification
npm run dev
```

### Exit Checklist
- [ ] Overview dashboard displays live or mocked system metrics and recent deployments.
- [ ] Project creation wizard successfully creates projects and updates the project list.
- [ ] Environment variable editor allows adding, masking, editing, and deleting variables.
- [ ] Deployment stream console renders live terminal logs with auto-scroll and status updates.
- [ ] Organizations and teams management screens render member lists and role selectors.
- [ ] Profile and security settings forms validate input and update state.
