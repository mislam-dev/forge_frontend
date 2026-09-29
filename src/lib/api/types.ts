/**
 * Standard Envelope and Data Transfer Objects (DTOs)
 * Strictly aligned with Axum OpenAPI 3.0 specification (`docs/api/openapi.yaml` & `docs/api/API_REQUESTS_SUMMARY.md`)
 */

// ==========================================
// 1. Standard Response & Error Envelopes
// ==========================================

export interface ApiResponse<T> {
  message: string;
  data: T;
  status?: 'success' | 'error'; // compatibility helper
}

export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
}

export interface ApiPaginatedResponse<T> {
  message: string;
  data: T[];
  pagination: ApiPagination;
  // Backward compatibility fields
  items?: T[];
  total_items?: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
}

export type PaginatedResponse<T> = ApiPaginatedResponse<T>;

export interface ApiErrorResponse {
  is_error: boolean;
  code: string;
  message: string;
  errors?: Record<string, string[]>;
}

// ==========================================
// 2. Authentication & User DTOs
// ==========================================

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  roles: string[];
  is_active?: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthTokensDTO {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user?: UserDTO;
}

export interface UserProfileDTO {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar_url?: string;
  github_handle?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  image?: string;
  created_at: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar_url?: string;
  github_handle?: string;
  image?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface UserSessionDTO {
  id: string;
  device: string;
  browser: string;
  ip_address: string;
  is_current: boolean;
  last_active: string;
}

// ==========================================
// 3. Access Control (RBAC) DTOs
// ==========================================

export interface PermissionDTO {
  id: string;
  name: string;
  code: string;
  module: string;
  description?: string;
  created_at?: string;
}

export interface RoleDTO {
  id: string;
  name: string;
  description?: string;
  is_system?: boolean;
  created_at?: string;
  permissions?: PermissionDTO[];
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
}

export interface CreatePermissionRequest {
  name: string;
  code: string;
  module: string;
  description?: string;
}

export interface UpdatePermissionRequest {
  name?: string;
  description?: string;
}

export interface AssignRolePermissionsRequest {
  role_id: string;
  permission_ids: string[];
}

export interface AssignUserRolesRequest {
  user_id: string;
  role_ids: string[];
}

export interface AssignUserPermissionsRequest {
  user_id: string;
  permission_ids: string[];
}

// ==========================================
// 4. Organizations & Teams DTOs
// ==========================================

export interface OrganizationDTO {
  id: string;
  name: string;
  slug: string;
  type?: string;
  description?: string;
  logo?: string;
  owner_user_id?: string;
  created_at: string;
}

export interface CreateOrgRequest {
  name: string;
  slug?: string;
  description?: string;
  type?: string;
}

export interface OrgMemberDTO {
  id: string;
  org_id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Member' | 'Viewer' | 'admin' | 'developer' | 'viewer' | string;
  joined_at: string;
}

export interface OrgInvitationDTO {
  id: string;
  org_id: string;
  email: string;
  role: 'Admin' | 'Member' | 'Viewer' | 'admin' | 'developer' | 'viewer' | string;
  invited_by?: string;
  invite_token?: string;
  created_at: string;
}

export interface InviteOrgMemberRequest {
  email: string;
  role: 'Admin' | 'Member' | 'Viewer' | 'admin' | 'developer' | 'viewer' | string;
}

export interface UpdateOrgMemberRoleRequest {
  role: 'Owner' | 'Admin' | 'Member' | 'Viewer' | 'admin' | 'developer' | 'viewer' | string;
}

export interface TeamDTO {
  id: string;
  name: string;
  description?: string;
  org_id: string;
  organization_id?: string;
  member_count?: number;
  created_at: string;
}

export interface CreateTeamDTO {
  organization_id: string;
  name: string;
  descriptions?: string | null;
  description?: string | null;
  org_id?: string;
}

export type CreateTeamRequest = CreateTeamDTO;

export interface TeamMemberDTO {
  id?: string;
  team_id: string;
  user_id: string;
  name?: string;
  email?: string;
  role: string;
  team_role?: string;
  joined_at: string;
}

export interface AddTeamMemberDTO {
  user_id: string;
  role: string;
}

export type AddTeamMemberRequest = AddTeamMemberDTO;

export interface UpdateTeamMemberRoleRequest {
  role: 'Lead' | 'Maintainer' | 'Member' | 'Viewer' | string;
}

// ==========================================
// 5. Projects & Repository Sub-Module DTOs
// ==========================================

export type ProjectRuntime = 'NodeJs' | 'Python' | 'Go' | 'Static';
export type ProjectType = 'Repo' | 'Files';

export interface ProjectDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  organization_id: string;
  owner_id?: string;
  project_type?: ProjectType;
  framework?: string;
  runtime?: ProjectRuntime;
  build_command?: string;
  run_command?: string;
  repository_url?: string;
  branch?: string;
  last_deployed_at?: string;
  latest_deployment_status?: DeploymentStatus;
  created_at: string;
  updated_at?: string;
}

export interface CreateProjectRequest {
  organization_id?: string | null;
  name: string;
  description?: string;
  slug?: string;
  framework?: string;
  runtime?: ProjectRuntime;
  project_type?: ProjectType;
  build_command?: string;
  run_command?: string;
  repository_url?: string;
  branch?: string;
  pat_token?: string;
  env_vars?: { key: string; value: string; environment?: string }[];
}

export interface GitValidationRequest {
  repo_url: string;
  auth_type?: 'none' | 'token' | 'ssh' | string;
  auth_token?: string;
}

export interface GitValidationResult {
  valid: boolean;
  branches: string[];
  message?: string;
}

export interface GitCommitDTO {
  hash: string;
  author: string;
  message: string;
  timestamp: string;
}

export interface ProjectRepositoryDTO {
  repo_url?: string;
  repository_url?: string; // backwards compatibility
  default_branch?: string;
  branch?: string; // backwards compatibility
  last_commit_hash?: string;
  sync_status?: string;
  pat_token_set?: boolean;
  auto_deploy?: boolean;
  updated_at?: string;
}

export interface ConnectProjectRepositoryDTO {
  repository_url: string;
  access_token?: string | null;
  default_branch?: string | null;
}

export type SaveRepositoryRequest = ConnectProjectRepositoryDTO;

export interface UpdateRepositoryRequest {
  repository_url: string;
  default_branch?: string | null;
  access_token?: string | null;
  branch?: string;
  pat_token?: string;
  auto_deploy?: boolean;
}

// ==========================================
// 6. Environment Variables DTOs
// ==========================================

export type ProjectEnvironment = 'Development' | 'Production' | 'Staging';

export interface EnvironmentVariableDTO {
  id: string;
  project_id: string;
  key: string;
  value?: string;
  masked_value: string;
  environment: ProjectEnvironment;
  is_secret?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateEnvVarRequest {
  key: string;
  value: string;
  environment: ProjectEnvironment;
  is_secret?: boolean;
}

export interface ProjectEnvVarItemDTO {
  key: string;
  value: string;
  is_secret?: boolean;
  environment: ProjectEnvironment;
}

export interface BulkCreateProjectEnvVarDTO {
  vars: ProjectEnvVarItemDTO[];
}

export type BulkEnvVarItem = ProjectEnvVarItemDTO;

export interface SaveEnvVarItem {
  key: string;
  value: string;
  environment: ProjectEnvironment;
  is_secret?: boolean;
}

export interface SaveEnvVarsRequest {
  variables: SaveEnvVarItem[];
}

// ==========================================
// 7. Project Assignments DTOs
// ==========================================

export interface ProjectMemberDTO {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'viewer' | 'Admin' | 'Member' | 'Viewer' | string;
  created_at?: string;
}

export interface ProjectTeamDTO {
  id?: string;
  project_id: string;
  team_id: string;
  name?: string;
  role?: 'developer' | 'viewer' | 'Admin' | 'Member' | 'Viewer' | string;
  member_count?: number;
  created_at?: string;
  assigned_at?: string;
  team?: {
    id: string;
    organization_id?: string;
    name: string;
    descriptions?: string | null;
    created_at?: string;
    updated_at?: string;
  };
}

export interface AssignProjectMemberRequest {
  user_id: string;
  role: 'admin' | 'developer' | 'viewer' | string;
}

export interface AssignProjectTeamRequest {
  team_id: string;
  role?: 'developer' | 'viewer' | string;
}

// Legacy unified project access
export interface ProjectAccessDTO {
  id: string;
  project_id: string;
  user_id?: string;
  team_id?: string;
  name: string;
  type: 'user' | 'team';
  role: 'Admin' | 'Member' | 'Viewer' | 'admin' | 'developer' | 'viewer' | string;
  created_at: string;
}

export interface AssignProjectRoleRequest {
  target_id: string;
  target_type: 'user' | 'team';
  role: 'Admin' | 'Member' | 'Viewer' | 'admin' | 'developer' | 'viewer' | string;
}

// ==========================================
// 8. Deployments & Build Logs DTOs
// ==========================================

export type DeploymentStatus =
  | 'Queued'
  | 'queued'
  | 'Building'
  | 'cloning'
  | 'building'
  | 'Deploying'
  | 'running'
  | 'Running'
  | 'healthy'
  | 'Success'
  | 'Failed'
  | 'failed'
  | 'Cancelled'
  | 'cancelled';

export interface DeploymentDTO {
  id: string;
  project_id: string;
  project_name?: string;
  deployment_number?: number;
  status: DeploymentStatus;
  stage?: string;
  branch: string;
  commit_hash?: string;
  commit_sha?: string; // compatibility
  commit_message?: string;
  environment?: string;
  triggered_by?: string;
  duration_seconds?: number;
  exit_code?: number;
  started_at?: string;
  finished_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface TriggerDeploymentRequest {
  project_id?: string;
  branch?: string;
  commit_hash?: string;
  commit_sha?: string;
  environment?: 'development' | 'staging' | 'production' | string;
}

export interface RollbackProjectRequest {
  target_deployment_id?: string;
  environment?: 'development' | 'staging' | 'production' | string;
}

export interface DeploymentLogLineDTO {
  line: number;
  timestamp?: string;
  level?: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | string;
  text: string;
  stage?: string;
}

export interface SseLogEvent {
  line?: number;
  timestamp?: string;
  level?: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | string;
  text?: string;
  message?: string;
}

export interface SseStatusEvent {
  status: DeploymentStatus;
  deployment_id: string;
  stage?: string;
}

// ==========================================
// 9. Notifications DTOs
// ==========================================

export interface NotificationDTO {
  id: string;
  title: string;
  message: string;
  type?: string;
  severity?: 'info' | 'warning' | 'error' | 'success';
  category?: 'deployment' | 'security' | 'team' | 'system' | string;
  is_read?: boolean;
  read_at?: string | null;
  link_url?: string;
  created_at: string;
}

export interface UnreadCountDTO {
  unread_count: number;
}

// ==========================================
// 10. Dashboard & Health DTOs
// ==========================================

export interface HealthLiveDTO {
  status: string;
  uptime_seconds: number;
}

export interface HealthReadyDTO {
  status: string;
  database: string;
  rabbitmq: string;
}

export interface HealthDeepDTO {
  status: string;
  database_pool: { status: string; latency_ms?: number };
  rabbitmq: { status: string; queue_depth?: number };
  redis?: { status: string };
  loki?: { status: string };
  docker?: { status: string };
}

export interface HealthStatusDTO {
  status: 'healthy' | 'degraded' | 'unhealthy' | string;
  uptime_seconds: number;
  database: 'connected' | 'disconnected' | 'up' | 'down' | string;
  version?: string;
}

export interface DashboardMetricsDTO {
  total_projects: number;
  active_deployments: number;
  success_rate_percent?: number;
  total_organizations?: number;
  system_health?: HealthStatusDTO;
  recent_deployments: DeploymentDTO[];
}

export interface UserDashboardDTO {
  recent_projects: ProjectDTO[];
  recent_deployments: DeploymentDTO[];
  pending_invites: OrgInvitationDTO[];
}

export interface OrgDashboardDTO {
  organization_id: string;
  team_count: number;
  project_count: number;
  active_deployments: number;
  failure_rate_percent: number;
}
