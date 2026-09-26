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
  UserProfileDTO,
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

  // Dashboard & Health
  if (normalizedMethod === 'GET' && cleanUrl === '/api/v1/dashboard/metrics') {
    return wrapSuccess({
      ...mockDashboardMetrics,
      total_projects: projectsStore.length,
      recent_deployments: Object.values(deploymentsStore).flat().slice(0, 5),
    });
  }
  if (normalizedMethod === 'GET' && cleanUrl === '/api/v1/health') {
    return wrapSuccess(mockSystemHealth);
  }

  // Projects
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
      project_type: (payload.project_type as any) || 'repo',
      runtime: (payload.runtime as any) || 'rust',
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
        repository_url: payload.repository_url as string,
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
        environment: ev.environment || 'all',
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
    if (normalizedMethod === 'PUT') {
      const payload = (data || {}) as Partial<ProjectDTO>;
      projectsStore = projectsStore.map((p) =>
        p.id === projectId ? { ...p, ...payload, updated_at: new Date().toISOString() } : p
      );
      const updated = projectsStore.find((p) => p.id === projectId) || projectsStore[0];
      return wrapSuccess(updated);
    }
    if (normalizedMethod === 'DELETE') {
      projectsStore = projectsStore.filter((p) => p.id !== projectId);
      return wrapSuccess(null, 'Project deleted');
    }
  }

  // Project Repository
  const repoMatch = cleanUrl.match(/^\/api\/v1\/projects\/([^/]+)\/repository$/);
  if (repoMatch) {
    const projectId = repoMatch[1];
    if (normalizedMethod === 'GET') {
      const repo = reposStore[projectId] || {
        repository_url: 'https://github.com/forge/app',
        branch: 'main',
        pat_token_set: false,
        auto_deploy: true,
      };
      return wrapSuccess(repo);
    }
    if (normalizedMethod === 'PUT') {
      const payload = (data || {}) as Record<string, unknown>;
      reposStore[projectId] = {
        repository_url: (payload.repository_url as string) || '',
        branch: (payload.branch as string) || 'main',
        pat_token_set: Boolean(payload.pat_token || reposStore[projectId]?.pat_token_set),
        auto_deploy: payload.auto_deploy !== undefined ? Boolean(payload.auto_deploy) : true,
        updated_at: new Date().toISOString(),
      };
      return wrapSuccess(reposStore[projectId], 'Repository settings updated');
    }
  }

  // Project Env Vars
  const envVarsMatch = cleanUrl.match(/^\/api\/v1\/projects\/([^/]+)\/env-vars$/);
  if (envVarsMatch) {
    const projectId = envVarsMatch[1];
    if (normalizedMethod === 'GET') {
      return wrapSuccess(envVarsStore[projectId] || []);
    }
    if (normalizedMethod === 'PUT') {
      const payload = (data || {}) as { variables: Array<{ key: string; value: string; environment: string }> };
      envVarsStore[projectId] = (payload.variables || []).map((v, idx) => ({
        id: `env-${Date.now()}-${idx}`,
        project_id: projectId,
        key: v.key,
        value: v.value,
        masked_value: v.value.length > 4 ? `••••••••` : '••••',
        environment: v.environment || 'all',
        created_at: new Date().toISOString(),
      }));
      return wrapSuccess(envVarsStore[projectId], 'Environment variables saved');
    }
  }

  // Project Access
  const accessMatch = cleanUrl.match(/^\/api\/v1\/projects\/([^/]+)\/access$/);
  if (accessMatch) {
    const projectId = accessMatch[1];
    if (normalizedMethod === 'GET') {
      return wrapSuccess(accessStore[projectId] || mockProjectAccess['proj-1'] || []);
    }
    if (normalizedMethod === 'POST') {
      const payload = (data || {}) as any;
      const newAccess: ProjectAccessDTO = {
        id: `acc-${Date.now()}`,
        project_id: projectId,
        user_id: payload.target_type === 'user' ? payload.target_id : undefined,
        team_id: payload.target_type === 'team' ? payload.target_id : undefined,
        name: payload.target_id || 'Assigned Member',
        type: payload.target_type || 'user',
        role: payload.role || 'Viewer',
        created_at: new Date().toISOString(),
      };
      if (!accessStore[projectId]) accessStore[projectId] = [];
      accessStore[projectId].push(newAccess);
      return wrapSuccess(newAccess, 'Role assigned successfully');
    }
  }

  // Project Deployments
  const deploymentsMatch = cleanUrl.match(/^\/api\/v1\/projects\/([^/]+)\/deployments$/);
  if (deploymentsMatch) {
    const projectId = deploymentsMatch[1];
    if (normalizedMethod === 'GET') {
      const list = deploymentsStore[projectId] || mockDeployments['proj-1'] || [];
      return wrapSuccess(list);
    }
    if (normalizedMethod === 'POST') {
      const proj = projectsStore.find((p) => p.id === projectId) || projectsStore[0];
      const newDep: DeploymentDTO = {
        id: `dep-${Date.now()}`,
        project_id: projectId,
        project_name: proj?.name || 'Project',
        deployment_number: ((deploymentsStore[projectId]?.[0]?.deployment_number) || 100) + 1,
        status: 'Building',
        branch: proj?.branch || 'main',
        commit_sha: Math.random().toString(16).substring(2, 9),
        commit_message: 'Manual deployment triggered from Forge console',
        triggered_by: 'Current User',
        duration_seconds: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (!deploymentsStore[projectId]) deploymentsStore[projectId] = [];
      deploymentsStore[projectId].unshift(newDep);
      return wrapSuccess(newDep, 'Deployment queued successfully');
    }
  }

  // Single Deployment Detail & Cancel
  const singleDepMatch = cleanUrl.match(/^\/api\/v1\/projects\/([^/]+)\/deployments\/([^/]+)$/);
  if (singleDepMatch) {
    const projectId = singleDepMatch[1];
    const depId = singleDepMatch[2];
    const allDeps = Object.values(deploymentsStore).flat();
    const dep = allDeps.find((d) => d.id === depId) || mockDeployments['proj-1'][0];
    return wrapSuccess(dep);
  }

  const cancelDepMatch = cleanUrl.match(/^\/api\/v1\/projects\/([^/]+)\/deployments\/([^/]+)\/cancel$/);
  if (cancelDepMatch && normalizedMethod === 'POST') {
    const projectId = cancelDepMatch[1];
    const depId = cancelDepMatch[2];
    if (deploymentsStore[projectId]) {
      deploymentsStore[projectId] = deploymentsStore[projectId].map((d) =>
        d.id === depId ? { ...d, status: 'Cancelled' as const } : d
      );
    }
    return wrapSuccess(null, 'Deployment cancelled');
  }

  // Organizations
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

  const teamMemberDeleteMatch = cleanUrl.match(/^\/api\/v1\/teams\/([^/]+)\/members\/([^/]+)$/);
  if (teamMemberDeleteMatch && normalizedMethod === 'DELETE') {
    const teamId = teamMemberDeleteMatch[1];
    const memberId = teamMemberDeleteMatch[2];
    if (teamMembersStore[teamId]) {
      teamMembersStore[teamId] = teamMembersStore[teamId].filter(
        (m) => m.id !== memberId && m.user_id !== memberId
      );
      teamsStore = teamsStore.map((t) =>
        t.id === teamId ? { ...t, member_count: teamMembersStore[teamId].length } : t
      );
    }
    return wrapSuccess(null, 'Member removed from team');
  }

  const teamMemberPatchMatch = cleanUrl.match(/^\/api\/v1\/teams\/([^/]+)\/members\/([^/]+)$/);
  if (teamMemberPatchMatch && normalizedMethod === 'PATCH') {
    const teamId = teamMemberPatchMatch[1];
    const memberId = teamMemberPatchMatch[2];
    const payload = (data || {}) as { role?: string };
    let updatedMember: TeamMemberDTO | null = null;
    if (teamMembersStore[teamId]) {
      teamMembersStore[teamId] = teamMembersStore[teamId].map((m) => {
        if (m.id === memberId || m.user_id === memberId) {
          updatedMember = { ...m, role: payload.role || m.role };
          return updatedMember;
        }
        return m;
      });
    }
    return wrapSuccess(updatedMember, 'Member role updated');
  }

  // Notifications
  if (normalizedMethod === 'GET' && cleanUrl === '/api/v1/notifications') {
    return wrapSuccess(notificationsStore);
  }
  const notifReadMatch = cleanUrl.match(/^\/api\/v1\/notifications\/([^/]+)\/read$/);
  if (notifReadMatch && normalizedMethod === 'PATCH') {
    const id = notifReadMatch[1];
    notificationsStore = notificationsStore.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    return wrapSuccess(null, 'Notification marked as read');
  }
  if (normalizedMethod === 'POST' && cleanUrl === '/api/v1/notifications/mark-all-read') {
    notificationsStore = notificationsStore.map((n) => ({ ...n, is_read: true }));
    return wrapSuccess(null, 'All notifications marked as read');
  }

  // Profile & Sessions
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
  const sessionRevokeMatch = cleanUrl.match(/^\/api\/v1\/users\/me\/sessions\/([^/]+)$/);
  if (sessionRevokeMatch && normalizedMethod === 'DELETE') {
    const sessId = sessionRevokeMatch[1];
    sessionsStore = sessionsStore.filter((s) => s.id !== sessId);
    return wrapSuccess(null, 'Session revoked');
  }

  return null;
}
