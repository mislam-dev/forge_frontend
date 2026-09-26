/**
 * Standard Envelope and Data Transfer Objects (DTOs)
 * Aligned with Axum OpenAPI 3.0.3 backend specifications and docs/frontend/05-module-specs.md
 */

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total_items: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// User & Auth DTOs
export interface UserDTO {
  id: string;
  name: string;
  email: string;
  roles: string[];
  is_active?: boolean;
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
  first_name: string;
  last_name: string;
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

// Organization & Team DTOs
export interface OrganizationDTO {
  id: string;
  name: string;
  slug: string;
  type: string;
  description?: string;
  logo?: string;
  owner_user_id: string;
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
  role: 'Owner' | 'Admin' | 'Member' | 'Viewer';
  joined_at: string;
}

export interface OrgInvitationDTO {
  id: string;
  org_id: string;
  email: string;
  role: 'Admin' | 'Member' | 'Viewer';
  invited_by: string;
  created_at: string;
}

export interface InviteOrgMemberRequest {
  email: string;
  role: 'Admin' | 'Member' | 'Viewer';
}

export interface UpdateOrgMemberRoleRequest {
  role: 'Owner' | 'Admin' | 'Member' | 'Viewer' | string;
}

export interface TeamDTO {
  id: string;
  name: string;
  description?: string;
  org_id: string;
  member_count?: number;
  created_at: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  org_id: string;
}

export interface TeamMemberDTO {
  id: string;
  team_id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  joined_at: string;
}

export interface AddTeamMemberRequest {
  user_id?: string;
  name?: string;
  email: string;
  role: 'Lead' | 'Maintainer' | 'Member' | 'Viewer' | string;
}

export interface UpdateTeamMemberRoleRequest {
  role: 'Lead' | 'Maintainer' | 'Member' | 'Viewer' | string;
}

// Project & Repository DTOs
export type ProjectRuntime = 'rust' | 'node' | 'python' | 'go' | 'docker' | string;
export type ProjectType = 'repo' | 'monorepo' | 'dockerfile' | string;

export interface ProjectDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  organization_id: string;
  owner_id: string;
  project_type: ProjectType;
  runtime: ProjectRuntime;
  repository_url?: string;
  branch?: string;
  last_deployed_at?: string;
  latest_deployment_status?: DeploymentStatus;
  created_at: string;
  updated_at?: string;
}

export interface CreateProjectRequest {
  name: string;
  slug?: string;
  description?: string;
  organization_id: string;
  project_type?: ProjectType;
  runtime: ProjectRuntime;
  repository_url?: string;
  branch?: string;
  pat_token?: string;
  env_vars?: { key: string; value: string; environment?: string }[];
}

export interface ProjectRepositoryDTO {
  repository_url: string;
  branch: string;
  pat_token_set?: boolean;
  auto_deploy?: boolean;
  updated_at?: string;
}

export interface UpdateRepositoryRequest {
  repository_url: string;
  branch: string;
  pat_token?: string;
  auto_deploy?: boolean;
}

// Environment Variables DTOs
export interface EnvironmentVariableDTO {
  id: string;
  project_id: string;
  key: string;
  value?: string;
  masked_value: string;
  environment: 'all' | 'production' | 'preview' | 'development' | string;
  created_at: string;
}

export interface SaveEnvVarItem {
  key: string;
  value: string;
  environment: string;
}

export interface SaveEnvVarsRequest {
  variables: SaveEnvVarItem[];
}

// Project Access DTOs
export interface ProjectAccessDTO {
  id: string;
  project_id: string;
  user_id?: string;
  team_id?: string;
  name: string;
  type: 'user' | 'team';
  role: 'Admin' | 'Member' | 'Viewer';
  created_at: string;
}

export interface AssignProjectRoleRequest {
  target_id: string;
  target_type: 'user' | 'team';
  role: 'Admin' | 'Member' | 'Viewer';
}

// Deployment DTOs
export type DeploymentStatus =
  | 'Queued'
  | 'Building'
  | 'Deploying'
  | 'Running'
  | 'Success'
  | 'Failed'
  | 'Cancelled';

export interface DeploymentDTO {
  id: string;
  project_id: string;
  project_name?: string;
  deployment_number: number;
  status: DeploymentStatus;
  branch: string;
  commit_sha: string;
  commit_message?: string;
  triggered_by: string;
  duration_seconds?: number;
  created_at: string;
  updated_at?: string;
}

export interface TriggerDeploymentRequest {
  branch?: string;
  commit_sha?: string;
}

export interface SseLogEvent {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | string;
  message: string;
}

export interface SseStatusEvent {
  status: DeploymentStatus;
  deployment_id: string;
}

// Notifications DTOs
export interface NotificationDTO {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  category?: 'deployment' | 'security' | 'team' | 'system' | string;
  is_read: boolean;
  link_url?: string;
  created_at: string;
}

// Dashboard Aggregator DTOs
export interface HealthStatusDTO {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime_seconds: number;
  database: 'connected' | 'disconnected';
  version: string;
}

export interface DashboardMetricsDTO {
  total_projects: number;
  active_deployments: number;
  success_rate_percent: number;
  total_organizations: number;
  system_health?: HealthStatusDTO;
  recent_deployments: DeploymentDTO[];
}
