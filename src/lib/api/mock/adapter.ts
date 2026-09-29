import {
  mockDashboardMetrics,
  mockDeployments,
  mockEnvVars,
  mockNotifications,
  mockOrganizations,
  mockOrgMembers,
  mockProjectAccess,
  mockProjectRepos,
  mockProjects,
  mockSystemHealth,
  mockTeams,
  mockTeamMembers,
  mockUserProfile,
  mockUserSessions,
  mockRoles,
  mockPermissions,
  mockGitBranches,
  mockLatestCommits,
  mockHistoricalLogs,
  mockHealthLive,
  mockHealthReady,
  mockHealthDeep,
} from './seeds';
import {
  ApiResponse,
  DeploymentDTO,
  EnvironmentVariableDTO,
  OrganizationDTO,
  OrgMemberDTO,
  ProjectAccessDTO,
  ProjectDTO,
  ProjectRepositoryDTO,
  TeamDTO,
  TeamMemberDTO,
  RoleDTO,
  PermissionDTO,
  ProjectMemberDTO,
  ProjectTeamDTO,
} from '../types';

let projectsStore = [...mockProjects];
const reposStore: Record<string, ProjectRepositoryDTO> = { ...mockProjectRepos };
const envVarsStore: Record<string, EnvironmentVariableDTO[]> = { ...mockEnvVars };
const accessStore: Record<string, ProjectAccessDTO[]> = { ...mockProjectAccess };
const deploymentsStore: Record<string, DeploymentDTO[]> = { ...mockDeployments };
let organizationsStore = [...mockOrganizations];
const orgMembersStore: Record<string, OrgMemberDTO[]> = { ...mockOrgMembers };
let teamsStore = [...mockTeams];
const teamMembersStore: Record<string, TeamMemberDTO[]> = { ...mockTeamMembers };
let notificationsStore = [...mockNotifications];
let profileStore = { ...mockUserProfile };
let sessionsStore = [...mockUserSessions];
let rolesStore: RoleDTO[] = [...mockRoles];
let permissionsStore: PermissionDTO[] = [...mockPermissions];

function wrapSuccess<T>(data: T, message = 'Success'): ApiResponse<T> {
  return {
    status: 'success',
    message,
    data,
  };
}

export function resolveMockRequest(
  method: string,
  url: string,
  data?: unknown
): ApiResponse<unknown> | null {
  const normalizedMethod = method.toUpperCase();
  const cleanUrl = url.split('?')[0];

  // ==========================================
  // 1. Dashboard & Health
  // ==========================================
  if (normalizedMethod === 'GET' && (cleanUrl === '/api/v1/dashboard' || cleanUrl === '/api/v1/dashboard/metrics')) {
    return wrapSuccess({
      ...mockDashboardMetrics,
      total_projects: projectsStore.length,
      recent_deployments: Object.values(deploymentsStore).flat().slice(0, 5),
    });
  }
  if (normalizedMethod === 'GET' && cleanUrl === '/api/v1/dashboard/user') {
    return wrapSuccess({
      recent_projects: projectsStore.slice(0, 5),
      recent_deployments: Object.values(deploymentsStore).flat().slice(0, 5),
      pending_invites: [],
    });
  }
  const orgDashboardMatch = cleanUrl.match(/^\/api\/v1\/dashboard\/org\/([^/]+)$/);
  if (orgDashboardMatch && normalizedMethod === 'GET') {
    const orgId = orgDashboardMatch[1];
    return wrapSuccess({
      organization_id: orgId,
      team_count: teamsStore.length,
      project_count: projectsStore.length,
      active_deployments: 1,
      failure_rate_percent: 1.5,
    });
  }
  if (normalizedMethod === 'GET' && cleanUrl === '/api/v1/health/live') {
    return wrapSuccess(mockHealthLive);
  }
  if (normalizedMethod === 'GET' && (cleanUrl === '/api/v1/health/ready' || cleanUrl === '/api/v1/health')) {
    return wrapSuccess(mockHealthReady);
  }
  if (normalizedMethod === 'GET' && cleanUrl === '/api/v1/health/deep') {
    return wrapSuccess(mockHealthDeep);
  }

  // ==========================================
  // 2. Projects Lifecycle
  // ==========================================
  if (normalizedMethod === 'GET' && cleanUrl === '/api/v1/projects') {
    return wrapSuccess(projectsStore);
  }
  if (normalizedMethod === 'POST' && cleanUrl === '/api/v1/projects') {
    const payload = (data || {}) as Record<string, unknown>;
    const newProject: ProjectDTO = {
      id: `proj-${Date.now()}`,
      name: (payload.name as string) || 'New Project',
      slug: ((payload.name as string) || 'new-project').toLowerCase().replace(/\s+/g, '-'),
      description: (payload.description as string) || '',
      organization_id: (payload.organization_id as string) || 'org-1',
      owner_id: 'user-1',
      project_type: (payload.project_type as any) || 'Repo',
      framework: (payload.framework as string) || 'NodeJs',
      runtime: (payload.runtime as any) || (payload.framework as any) || 'NodeJs',
      build_command: (payload.build_command as string) || 'cargo build --release',
      run_command: (payload.run_command as string) || './target/release/app',
      repository_url: payload.repository_url as string | undefined,
      branch: (payload.branch as string) || 'main',
      last_deployed_at: undefined,
      latest_deployment_status: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    projectsStore.unshift(newProject);

    if (payload.repository_url) {
      reposStore[newProject.id] = {
        repo_url: payload.repository_url as string,
        repository_url: payload.repository_url as string,
        default_branch: (payload.branch as string) || 'main',
        branch: (payload.branch as string) || 'main',
        pat_token_set: Boolean(payload.pat_token),
        auto_deploy: true,
        updated_at: new Date().toISOString(),
      };
    }

    if (Array.isArray(payload.env_vars)) {
      envVarsStore[newProject.id] = payload.env_vars.map((ev: any, idx: number) => ({
        id: `env-${Date.now()}-${idx}`,
        project_id: newProject.id,
        key: ev.key,
        value: ev.value,
        masked_value: '••••••••',
        environment: ev.environment || 'development',
        is_secret: true,
        created_at: new Date().toISOString(),
      }));
    }

    return wrapSuccess(newProject, 'Project created successfully');
  }

  // Project Detail & Settings
  const projectDetailMatch = cleanUrl.match(/^\/api\/v1\/projects\/([^/]+)$/);
  if (projectDetailMatch) {
    const projectId = projectDetailMatch[1];
    if (normalizedMethod === 'GET') {
      const proj = projectsStore.find((p) => p.id === projectId) || projectsStore[0];
      return wrapSuccess(proj);
    }
    if (normalizedMethod === 'PUT' || normalizedMethod === 'PATCH') {
      const payload = (data || {}) as Partial<ProjectDTO>;
      projectsStore = projectsStore.map((p) =>
        p.id === projectId ? { ...p, ...payload, updated_at: new Date().toISOString() } : p
      );
      const updated = projectsStore.find((p) => p.id === projectId) || projectsStore[0];
      return wrapSuccess(updated, 'Project updated successfully');
    }
    if (normalizedMethod === 'DELETE') {
      projectsStore = projectsStore.filter((p) => p.id !== projectId);
      return wrapSuccess(null, 'Project deleted');
    }
  }

  // ==========================================
  // 3. Project Repository Sub-Module
  // ==========================================
  const repoValidateMatch = cleanUrl.match(/^\/api\/v1\/projects\/([^/]+)\/repository\/validate$/);
  if (repoValidateMatch && normalizedMethod === 'POST') {
    return wrapSuccess({
      valid: true,
      branches: mockGitBranches,
      message: 'Git credentials verified and remote branches fetched',
    });
  }

  const repoCloneMatch = cleanUrl.match(/^\/api\/v1\/projects\/([^/]+)\/repository\/clone$/);
  if (repoCloneMatch && normalizedMethod === 'POST') {
    return wrapSuccess({
      status: 'accepted',
      message: 'Repository clone job queued into build worker',
    });
  }

  const repoCommitMatch = cleanUrl.match(/^\/api\/v1\/projects\/([^/]+)\/repository\/commit$/);
  if (repoCommitMatch && normalizedMethod === 'GET') {
    const projectId = repoCommitMatch[1];
    const commit = mockLatestCommits[projectId] || mockLatestCommits['proj-1'];
    return wrapSuccess(commit);
  }

  const repoBranchMatch = cleanUrl.match(/^\/api\/v1\/projects\/([^/]+)\/repository\/branch$/);
  if (repoBranchMatch && normalizedMethod === 'PUT') {
    const projectId = repoBranchMatch[1];
    const payload = (data || {}) as { branch: string };
    if (reposStore[projectId]) {
      reposStore[projectId].default_branch = payload.branch;
      reposStore[projectId].branch = payload.branch;
    }
    return wrapSuccess(reposStore[projectId], 'Default branch updated');
  }

  const repoBranchesMatch = cleanUrl.match(/^\/api\/v1\/projects\/([^/]+)\/repository\/branches$/);
  if (repoBranchesMatch && normalizedMethod === 'GET') {
    return wrapSuccess(mockGitBranches);
  }

  const repoMatch = cleanUrl.match(/^\/api\/v1\/projects\/([^/]+)\/repository$/);
  if (repoMatch) {
    const projectId = repoMatch[1];
    if (normalizedMethod === 'GET') {
      const repo = reposStore[projectId] || {
        repo_url: 'https://github.com/forge/app',
        repository_url: 'https://github.com/forge/app',
        default_branch: 'main',
        branch: 'main',
        pat_token_set: false,
        auto_deploy: true,
      };
      return wrapSuccess(repo);
    }
    if (normalizedMethod === 'POST' || normalizedMethod === 'PUT') {
      const payload = (data || {}) as Record<string, unknown>;
      reposStore[projectId] = {
        repo_url: (payload.repo_url as string) || (payload.repository_url as string) || '',
        repository_url: (payload.repo_url as string) || (payload.repository_url as string) || '',
        default_branch: (payload.default_branch as string) || (payload.branch as string) || 'main',
        branch: (payload.default_branch as string) || (payload.branch as string) || 'main',
        pat_token_set: Boolean(payload.auth_token || payload.pat_token || reposStore[projectId]?.pat_token_set),
        auto_deploy: payload.auto_deploy !== undefined ? Boolean(payload.auto_deploy) : true,
        updated_at: new Date().toISOString(),
      };
      return wrapSuccess(reposStore[projectId], 'Repository settings saved');
    }
  }

  // ==========================================
  // 4. Environment Variables
  // ==========================================
  const envVarsBulkMatch = cleanUrl.match(/^\/api\/v1\/projects\/([^/]+)\/env-vars\/bulk$/);
  if (envVarsBulkMatch && normalizedMethod === 'POST') {
    const projectId = envVarsBulkMatch[1];
    const items = (Array.isArray(data) ? data : (data as any)?.variables || []) as Array<{
      key: string;
      value: string;
      environment?: string;
      is_secret?: boolean;
    }>;
    if (!envVarsStore[projectId]) envVarsStore[projectId] = [];
    items.forEach((v, idx) => {
      envVarsStore[projectId].push({
        id: `env-${Date.now()}-${idx}`,
        project_id: projectId,
        key: v.key,
        value: v.value,
        masked_value: '••••••••',
        environment: v.environment || 'development',
        is_secret: v.is_secret !== undefined ? v.is_secret : true,
        created_at: new Date().toISOString(),
      });
    });
    return wrapSuccess({ count: items.length }, `${items.length} variables saved`);
  }

  const envVarsDecryptMatch = cleanUrl.match(/^\/api\/v1\/projects\/([^/]+)\/env-vars\/decrypt$/);
  if (envVarsDecryptMatch && normalizedMethod === 'GET') {
    const projectId = envVarsDecryptMatch[1];
    const decrypted: Record<string, string> = {};
    (envVarsStore[projectId] || []).forEach((ev) => {
      decrypted[ev.key] = ev.value || 'secret_sample_value';
    });
    return wrapSuccess(decrypted);
  }

  const envVarSingleMatch = cleanUrl.match(/^\/api\/v1\/projects\/([^/]+)\/env-vars\/([^/]+)$/);
  if (envVarSingleMatch) {
    const projectId = envVarSingleMatch[1];
    const envId = envVarSingleMatch[2];
    if (normalizedMethod === 'PUT' || normalizedMethod === 'PATCH') {
      const payload = (data || {}) as Partial<EnvironmentVariableDTO>;
      if (envVarsStore[projectId]) {
        envVarsStore[projectId] = envVarsStore[projectId].map((ev) =>
          ev.id === envId ? { ...ev, ...payload, updated_at: new Date().toISOString() } : ev
        );
      }
      const updated = envVarsStore[projectId]?.find((ev) => ev.id === envId);
      return wrapSuccess(updated, 'Variable updated');
    }
    if (normalizedMethod === 'DELETE') {
      if (envVarsStore[projectId]) {
        envVarsStore[projectId] = envVarsStore[projectId].filter((ev) => ev.id !== envId);
      }
      return wrapSuccess(null, 'Variable deleted');
    }
  }

  const envVarsMatch = cleanUrl.match(/^\/api\/v1\/projects\/([^/]+)\/env-vars$/);
  if (envVarsMatch) {
    const projectId = envVarsMatch[1];
    if (normalizedMethod === 'GET') {
      return wrapSuccess(envVarsStore[projectId] || []);
    }
    if (normalizedMethod === 'POST') {
      const payload = (data || {}) as any;
      const newVar: EnvironmentVariableDTO = {
        id: `env-${Date.now()}`,
        project_id: projectId,
        key: payload.key,
        value: payload.value,
        masked_value: '••••••••',
        environment: payload.environment || 'development',
        is_secret: payload.is_secret !== undefined ? payload.is_secret : true,
        created_at: new Date().toISOString(),
      };
      if (!envVarsStore[projectId]) envVarsStore[projectId] = [];
      envVarsStore[projectId].push(newVar);
      return wrapSuccess(newVar, 'Variable created');
    }
  }

  // ==========================================
  // 5. Project Assignments (Members & Teams)
  // ==========================================
  const projectMembersMatch = cleanUrl.match(/^\/api\/v1\/projects\/([^/]+)\/members$/);
  if (projectMembersMatch) {
    const projectId = projectMembersMatch[1];
    if (normalizedMethod === 'GET') {
      const members: ProjectMemberDTO[] = (accessStore[projectId] || mockProjectAccess['proj-1'] || [])
        .filter((a) => a.type === 'user')
        .map((a) => ({
          id: a.id,
          project_id: projectId,
          user_id: a.user_id || a.id,
          name: a.name,
          email: `${a.name.toLowerCase().replace(/\s+/g, '.')}@forge.dev`,
          role: a.role,
          created_at: a.created_at,
        }));
      return wrapSuccess(members);
    }
    if (normalizedMethod === 'POST') {
      const payload = (data || {}) as any;
      const newMember: ProjectMemberDTO = {
        id: `pmem-${Date.now()}`,
        project_id: projectId,
        user_id: payload.user_id,
        name: payload.name || 'Assigned Developer',
        email: payload.email || 'developer@forge.dev',
        role: payload.role || 'developer',
        created_at: new Date().toISOString(),
      };
      if (!accessStore[projectId]) accessStore[projectId] = [];
      accessStore[projectId].push({
        id: newMember.id,
        project_id: projectId,
        user_id: newMember.user_id,
        name: newMember.name,
        type: 'user',
        role: newMember.role as any,
        created_at: newMember.created_at || new Date().toISOString(),
      });
      return wrapSuccess(newMember, 'Member assigned to project');
    }
  }

  const projectMemberDeleteMatch = cleanUrl.match(/^\/api\/v1\/projects\/([^/]+)\/members\/([^/]+)$/);
  if (projectMemberDeleteMatch && normalizedMethod === 'DELETE') {
    const projectId = projectMemberDeleteMatch[1];
    const userId = projectMemberDeleteMatch[2];
    if (accessStore[projectId]) {
      accessStore[projectId] = accessStore[projectId].filter((a) => a.user_id !== userId && a.id !== userId);
    }
    return wrapSuccess(null, 'User unassigned from project');
  }

  const projectTeamsMatch = cleanUrl.match(/^\/api\/v1\/projects\/([^/]+)\/teams$/);
  if (projectTeamsMatch) {
    const projectId = projectTeamsMatch[1];
    if (normalizedMethod === 'GET') {
      const teams: ProjectTeamDTO[] = (accessStore[projectId] || mockProjectAccess['proj-1'] || [])
        .filter((a) => a.type === 'team')
        .map((a) => ({
          id: a.id,
          project_id: projectId,
          team_id: a.team_id || a.id,
          name: a.name,
          role: a.role as any,
          member_count: 3,
          created_at: a.created_at,
        }));
      return wrapSuccess(teams);
    }
    if (normalizedMethod === 'POST') {
      const payload = (data || {}) as any;
      const targetTeam = teamsStore.find((t) => t.id === payload.team_id) || teamsStore[0];
      const newTeamAssignment: ProjectTeamDTO = {
        id: `pteam-${Date.now()}`,
        project_id: projectId,
        team_id: payload.team_id,
        name: targetTeam?.name || 'Assigned Team',
        role: payload.role || 'developer',
        member_count: targetTeam?.member_count || 2,
        created_at: new Date().toISOString(),
      };
      if (!accessStore[projectId]) accessStore[projectId] = [];
      accessStore[projectId].push({
        id: newTeamAssignment.id,
        project_id: projectId,
        team_id: newTeamAssignment.team_id,
        name: newTeamAssignment.name,
        type: 'team',
        role: newTeamAssignment.role as any,
        created_at: newTeamAssignment.created_at || new Date().toISOString(),
      });
      return wrapSuccess(newTeamAssignment, 'Team assigned to project');
    }
  }

  const projectTeamDeleteMatch = cleanUrl.match(/^\/api\/v1\/projects\/([^/]+)\/teams\/([^/]+)$/);
  if (projectTeamDeleteMatch && normalizedMethod === 'DELETE') {
    const projectId = projectTeamDeleteMatch[1];
    const teamId = projectTeamDeleteMatch[2];
    if (accessStore[projectId]) {
      accessStore[projectId] = accessStore[projectId].filter((a) => a.team_id !== teamId && a.id !== teamId);
    }
    return wrapSuccess(null, 'Team unassigned from project');
  }

  // ==========================================
  // 6. Deployments & Build Logs
  // ==========================================
  // Trigger deployment: POST /api/v1/deployments
  if (normalizedMethod === 'POST' && cleanUrl === '/api/v1/deployments') {
    const payload = (data || {}) as any;
    const projectId = payload.project_id || 'proj-1';
    const proj = projectsStore.find((p) => p.id === projectId) || projectsStore[0];
    const newDep: DeploymentDTO = {
      id: `dep-${Date.now()}`,
      project_id: projectId,
      project_name: proj?.name || 'Project',
      deployment_number: ((deploymentsStore[projectId]?.[0]?.deployment_number) || 100) + 1,
      status: 'Building',
      stage: 'building',
      branch: payload.branch || proj?.branch || 'main',
      commit_hash: payload.commit_hash || payload.commit_sha || Math.random().toString(16).substring(2, 9),
      commit_sha: payload.commit_hash || payload.commit_sha || Math.random().toString(16).substring(2, 9),
      commit_message: 'Manual deployment triggered from Forge console',
      environment: payload.environment || 'production',
      triggered_by: 'Current User',
      duration_seconds: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (!deploymentsStore[projectId]) deploymentsStore[projectId] = [];
    deploymentsStore[projectId].unshift(newDep);
    return wrapSuccess(newDep, 'Deployment queued successfully');
  }

  // List project deployments: GET /api/v1/projects/:id/deployments
  const projectDeploymentsMatch = cleanUrl.match(/^\/api\/v1\/projects\/([^/]+)\/deployments$/);
  if (projectDeploymentsMatch && normalizedMethod === 'GET') {
    const projectId = projectDeploymentsMatch[1];
    const list = deploymentsStore[projectId] || mockDeployments['proj-1'] || [];
    return wrapSuccess(list);
  }

  // Project rollback: POST /api/v1/projects/:id/rollback
  const rollbackMatch = cleanUrl.match(/^\/api\/v1\/projects\/([^/]+)\/rollback$/);
  if (rollbackMatch && normalizedMethod === 'POST') {
    const projectId = rollbackMatch[1];
    const list = deploymentsStore[projectId] || mockDeployments['proj-1'];
    const pastHealthy = list[list.length - 1];
    return wrapSuccess(pastHealthy, 'Rollback deployment triggered');
  }

  // Redeploy: POST /api/v1/deployments/:id/redeploy
  const redeployMatch = cleanUrl.match(/^\/api\/v1\/deployments\/([^/]+)\/redeploy$/);
  if (redeployMatch && normalizedMethod === 'POST') {
    const depId = redeployMatch[1];
    const allDeps = Object.values(deploymentsStore).flat();
    const existing = allDeps.find((d) => d.id === depId) || mockDeployments['proj-1'][0];
    const reDep: DeploymentDTO = {
      ...existing,
      id: `dep-${Date.now()}`,
      status: 'Queued',
      stage: 'queued',
      created_at: new Date().toISOString(),
    };
    if (deploymentsStore[existing.project_id]) {
      deploymentsStore[existing.project_id].unshift(reDep);
    }
    return wrapSuccess(reDep, 'Deployment redeployed successfully');
  }

  // Deployment Logs: GET /api/v1/deployments/:id/logs
  const logsMatch = cleanUrl.match(/^\/api\/v1\/deployments\/([^/]+)\/logs$/);
  if (logsMatch && normalizedMethod === 'GET') {
    const depId = logsMatch[1];
    const logs = mockHistoricalLogs[depId] || mockHistoricalLogs['dep-1'];
    return wrapSuccess(logs);
  }

  // Search logs: GET /api/v1/deployments/:id/logs/search
  const searchLogsMatch = cleanUrl.match(/^\/api\/v1\/deployments\/([^/]+)\/logs\/search$/);
  if (searchLogsMatch && normalizedMethod === 'GET') {
    return wrapSuccess(mockHistoricalLogs['dep-1']);
  }

  // Single Deployment Detail: GET /api/v1/deployments/:id
  const depDetailMatch = cleanUrl.match(/^\/api\/v1\/deployments\/([^/]+)$/);
  if (depDetailMatch && normalizedMethod === 'GET') {
    const depId = depDetailMatch[1];
    const allDeps = Object.values(deploymentsStore).flat();
    const dep = allDeps.find((d) => d.id === depId) || mockDeployments['proj-1'][0];
    return wrapSuccess(dep);
  }

  // ==========================================
  // 7. Access Control (RBAC)
  // ==========================================
  if (normalizedMethod === 'GET' && cleanUrl === '/api/v1/access-control/roles') {
    return wrapSuccess(rolesStore);
  }
  if (normalizedMethod === 'POST' && cleanUrl === '/api/v1/access-control/roles') {
    const payload = (data || {}) as any;
    const newRole: RoleDTO = {
      id: `role-${Date.now()}`,
      name: payload.name || 'New Role',
      description: payload.description || '',
      is_system: false,
      created_at: new Date().toISOString(),
      permissions: [],
    };
    rolesStore.push(newRole);
    return wrapSuccess(newRole, 'Role created');
  }
  const roleDetailMatch = cleanUrl.match(/^\/api\/v1\/access-control\/roles\/([^/]+)$/);
  if (roleDetailMatch) {
    const roleId = roleDetailMatch[1];
    if (normalizedMethod === 'GET') {
      const role = rolesStore.find((r) => r.id === roleId) || rolesStore[0];
      return wrapSuccess(role);
    }
    if (normalizedMethod === 'PATCH' || normalizedMethod === 'PUT') {
      const payload = (data || {}) as any;
      rolesStore = rolesStore.map((r) => (r.id === roleId ? { ...r, ...payload } : r));
      const updated = rolesStore.find((r) => r.id === roleId);
      return wrapSuccess(updated, 'Role updated');
    }
    if (normalizedMethod === 'DELETE') {
      rolesStore = rolesStore.filter((r) => r.id !== roleId);
      return wrapSuccess(null, 'Role deleted');
    }
  }

  if (normalizedMethod === 'GET' && cleanUrl === '/api/v1/access-control/permissions') {
    return wrapSuccess(permissionsStore);
  }

  // ==========================================
  // 8. Organizations & Teams
  // ==========================================
  if (normalizedMethod === 'GET' && cleanUrl === '/api/v1/organizations') {
    return wrapSuccess(organizationsStore);
  }
  if (normalizedMethod === 'POST' && cleanUrl === '/api/v1/organizations') {
    const payload = (data || {}) as any;
    const newOrg: OrganizationDTO = {
      id: `org-${Date.now()}`,
      name: payload.name || 'New Organization',
      slug: (payload.name || 'new-org').toLowerCase().replace(/\s+/g, '-'),
      type: payload.type || 'Team',
      description: payload.description || '',
      owner_user_id: 'user-1',
      created_at: new Date().toISOString(),
    };
    organizationsStore.push(newOrg);
    return wrapSuccess(newOrg, 'Organization created');
  }

  const orgDetailMatch = cleanUrl.match(/^\/api\/v1\/organizations\/([^/]+)$/);
  if (orgDetailMatch && normalizedMethod === 'GET') {
    const orgId = orgDetailMatch[1];
    const org = organizationsStore.find((o) => o.id === orgId) || organizationsStore[0];
    return wrapSuccess(org);
  }

  const orgMembersMatch = cleanUrl.match(/^\/api\/v1\/organizations\/([^/]+)\/members$/);
  if (orgMembersMatch && normalizedMethod === 'GET') {
    const orgId = orgMembersMatch[1];
    return wrapSuccess(orgMembersStore[orgId] || mockOrgMembers['org-1']);
  }

  const orgInvitesMatch = cleanUrl.match(/^\/api\/v1\/organizations\/([^/]+)\/invitations$/);
  if (orgInvitesMatch && normalizedMethod === 'POST') {
    const orgId = orgInvitesMatch[1];
    const payload = (data || {}) as any;
    const newMember: OrgMemberDTO = {
      id: `mem-${Date.now()}`,
      org_id: orgId,
      user_id: `user-${Date.now()}`,
      name: payload.email.split('@')[0],
      email: payload.email,
      role: payload.role || 'Member',
      joined_at: new Date().toISOString(),
    };
    if (!orgMembersStore[orgId]) orgMembersStore[orgId] = [...mockOrgMembers['org-1']];
    orgMembersStore[orgId].push(newMember);
    return wrapSuccess(newMember, 'Invitation sent');
  }

  const orgMemberDeleteMatch = cleanUrl.match(/^\/api\/v1\/organizations\/([^/]+)\/members\/([^/]+)$/);
  if (orgMemberDeleteMatch && normalizedMethod === 'DELETE') {
    const orgId = orgMemberDeleteMatch[1];
    const memberId = orgMemberDeleteMatch[2];
    if (orgMembersStore[orgId]) {
      orgMembersStore[orgId] = orgMembersStore[orgId].filter(
        (m) => m.id !== memberId && m.user_id !== memberId
      );
    }
    return wrapSuccess(null, 'Organization member removed');
  }

  const orgMemberPatchMatch = cleanUrl.match(/^\/api\/v1\/organizations\/([^/]+)\/members\/([^/]+)$/);
  if (orgMemberPatchMatch && normalizedMethod === 'PATCH') {
    const orgId = orgMemberPatchMatch[1];
    const memberId = orgMemberPatchMatch[2];
    const payload = (data || {}) as { role?: string };
    if (!orgMembersStore[orgId]) {
      orgMembersStore[orgId] = [...(mockOrgMembers[orgId] || mockOrgMembers['org-1'] || [])];
    }
    let updatedMember: OrgMemberDTO | null = null;
    orgMembersStore[orgId] = orgMembersStore[orgId].map((m) => {
      if (m.id === memberId || m.user_id === memberId) {
        updatedMember = { ...m, role: (payload.role as any) || m.role };
        return updatedMember;
      }
      return m;
    });
    return wrapSuccess(updatedMember, 'Organization member role updated');
  }

  const orgTeamsMatch = cleanUrl.match(/^\/api\/v1\/organizations\/([^/]+)\/teams$/);
  if (orgTeamsMatch && normalizedMethod === 'GET') {
    const orgId = orgTeamsMatch[1];
    return wrapSuccess(teamsStore.filter((t) => t.org_id === orgId || t.org_id === 'org-1'));
  }

  // Teams
  if (normalizedMethod === 'GET' && cleanUrl === '/api/v1/teams') {
    return wrapSuccess(teamsStore);
  }
  if (normalizedMethod === 'POST' && cleanUrl === '/api/v1/teams') {
    const payload = (data || {}) as any;
    const newTeam: TeamDTO = {
      id: `team-${Date.now()}`,
      name: payload.name || 'New Team',
      description: payload.description || '',
      org_id: payload.org_id || 'org-1',
      member_count: 1,
      created_at: new Date().toISOString(),
    };
    teamsStore.push(newTeam);
    return wrapSuccess(newTeam, 'Team created');
  }
  const teamDeleteMatch = cleanUrl.match(/^\/api\/v1\/teams\/([^/]+)$/);
  if (teamDeleteMatch && normalizedMethod === 'DELETE') {
    const teamId = teamDeleteMatch[1];
    teamsStore = teamsStore.filter((t) => t.id !== teamId);
    return wrapSuccess(null, 'Team removed');
  }

  const teamMembersMatch = cleanUrl.match(/^\/api\/v1\/teams\/([^/]+)\/members$/);
  if (teamMembersMatch) {
    const teamId = teamMembersMatch[1];
    if (normalizedMethod === 'GET') {
      return wrapSuccess(teamMembersStore[teamId] || []);
    }
    if (normalizedMethod === 'POST') {
      const payload = (data || {}) as any;
      const newMember: TeamMemberDTO = {
        id: `tmem-${Date.now()}`,
        team_id: teamId,
        user_id: payload.user_id || `user-${Date.now()}`,
        name: payload.name || (payload.email ? payload.email.split('@')[0] : 'Member'),
        email: payload.email || 'member@forge.dev',
        role: payload.role || 'Member',
        joined_at: new Date().toISOString(),
      };
      if (!teamMembersStore[teamId]) teamMembersStore[teamId] = [];
      teamMembersStore[teamId].push(newMember);

      teamsStore = teamsStore.map((t) =>
        t.id === teamId ? { ...t, member_count: teamMembersStore[teamId].length } : t
      );

      return wrapSuccess(newMember, 'Member added to team');
    }
  }

  // ==========================================
  // 9. Notifications
  // ==========================================
  if (normalizedMethod === 'GET' && cleanUrl === '/api/v1/notifications') {
    return wrapSuccess(notificationsStore);
  }
  if (normalizedMethod === 'GET' && cleanUrl === '/api/v1/notifications/unread-count') {
    const unread = notificationsStore.filter((n) => !n.is_read).length;
    return wrapSuccess({ unread_count: unread });
  }
  const notifReadMatch = cleanUrl.match(/^\/api\/v1\/notifications\/([^/]+)\/read$/);
  if (notifReadMatch && normalizedMethod === 'PATCH') {
    const id = notifReadMatch[1];
    notificationsStore = notificationsStore.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    return wrapSuccess(null, 'Notification marked as read');
  }
  if (normalizedMethod === 'PATCH' && cleanUrl === '/api/v1/notifications/read-all') {
    notificationsStore = notificationsStore.map((n) => ({ ...n, is_read: true }));
    return wrapSuccess({ count: notificationsStore.length }, 'All notifications marked as read');
  }
  const notifDeleteMatch = cleanUrl.match(/^\/api\/v1\/notifications\/([^/]+)$/);
  if (notifDeleteMatch && normalizedMethod === 'DELETE') {
    const id = notifDeleteMatch[1];
    notificationsStore = notificationsStore.filter((n) => n.id !== id);
    return wrapSuccess(null, 'Notification deleted');
  }

  // ==========================================
  // 10. Profile & Sessions
  // ==========================================
  if (normalizedMethod === 'GET' && cleanUrl === '/api/v1/users/me') {
    return wrapSuccess(profileStore);
  }
  if (normalizedMethod === 'PATCH' && cleanUrl === '/api/v1/users/me') {
    const payload = (data || {}) as any;
    profileStore = { ...profileStore, ...payload };
    return wrapSuccess(profileStore, 'Profile updated');
  }
  if (normalizedMethod === 'POST' && cleanUrl === '/api/v1/users/me/password') {
    return wrapSuccess(null, 'Password updated successfully');
  }
  if (normalizedMethod === 'GET' && cleanUrl === '/api/v1/users/me/sessions') {
    return wrapSuccess(sessionsStore);
  }

  return null;
}
