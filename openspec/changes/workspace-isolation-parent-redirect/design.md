# Design

## Context

See `proposal.md` for background and problem statement. In Next.js App Router, the client-side workspace switcher in `Sidebar.tsx` updates `activeOrgId` in `useWorkspaceStore` and invalidates React Query caches, but does not perform route navigation. As a result, switching from an organization to personal profile or between organizations keeps the browser on `/projects/[id]/*` or `/teams/[id]/*`. If the child resource belonged to another workspace, the user remains looking at an orphaned or mismatched resource, violating workspace isolation.

Per user requirements:
- When switching to Personal workspace from projects, teams, or organizations: redirect directly to `/dashboard`.
- When switching between organizations: redirect child routes to their parent directory (`/projects` for projects, `/teams` for teams).

## Goals / Non-Goals

**Goals:**
- Provide immediate, route-aware redirection upon workspace selection in `Sidebar.tsx`:
  - When switching to Personal Profile: if currently on `/projects`, `/projects/[id]/*`, `/teams`, `/teams/[id]/*`, or `/organizations/[id]/*` → redirect to `/dashboard`.
  - When switching to Organization B:
    - From any `/projects/...` child route (`/projects/[id]/*`, `/projects/new`) → redirect to parent `/projects`.
    - From any `/teams/...` child route (`/teams/[id]/*`, `/teams/new`) → redirect to parent `/teams`.
    - From `/organizations/[id]/*` → redirect to `/organizations/[org-b-id]`.
- Provide defensive isolation guards in `ProjectHeader.tsx` and `/teams/[id]/members/page.tsx`:
  - If a loaded project belongs to an organization different from `activeOrgId`, redirect to `/dashboard` (if personal workspace) or `/projects` (if organization workspace).
  - If a loaded team belongs to an organization different from `activeOrgId`, or if personal profile is active, redirect to `/dashboard` (if personal workspace) or `/teams` (if organization workspace).

**Non-Goals:**
- Altering the backend authentication token or tenant headers in `client.ts` (already reading `activeOrgId`).
- Changing global `/dashboard`, `/notifications`, or `/settings` navigation.

## Decisions

### Decision 1: Two-Layer Workspace Isolation Strategy
1. **Interactive Layer (Proactive)**: Triggered synchronously when a user picks a different organization or personal profile in `Sidebar.tsx`. Redirects to `/dashboard` for personal profile, or to the parent route when switching between organizations.
2. **Reactivity Layer (Defensive)**: Implemented in `ProjectHeader.tsx` (shared by all project subpages) and `TeamMembersStandalonePage`. If `activeOrgId` changes out-of-band or an entity loads whose `organization_id` does not match the active workspace context, it redirects via `router.replace` to `/dashboard` (if personal) or parent (`/projects` or `/teams`).

### Decision 2: Redirection Matrix
| Current Route | Target Workspace | Redirect Destination |
|---|---|---|
| `/projects` or `/projects/[id]/*` or `/projects/new` | Personal Profile | `/dashboard` |
| `/projects/[id]/*` or `/projects/new` | Organization B | `/projects` |
| `/teams` or `/teams/[id]/*` or `/teams/new` | Personal Profile | `/dashboard` |
| `/teams/[id]/*` or `/teams/new` | Organization B | `/teams` |
| `/organizations/[id]/*` | Personal Profile | `/dashboard` |
| `/organizations/[id]/*` | Organization B | `/organizations/[org-b-id]` |

## Risks / Trade-offs

- **[Risk] Redirection loop during initial page load**: If `activeOrgId` or `project` data is still loading, an eager guard might redirect before state settles.
  - **Mitigation**: Ensure isolation `useEffect` checks only fire when `!isLoading && project` (or `team`) is fully resolved and `activeOrgId` is initialized.
