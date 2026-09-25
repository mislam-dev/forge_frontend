/**
 * Standard Envelope and Data Transfer Objects (DTOs)
 * Aligned with Axum OpenAPI 3.0.3 backend specifications.
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

export interface TeamDTO {
  id: string;
  name: string;
  description?: string;
  org_id: string;
  member_count?: number;
  created_at: string;
}

// Project & Environment Variable DTOs
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
  created_at: string;
}

export interface EnvironmentVariableDTO {
  id: string;
  project_id: string;
  key: string;
  masked_value: string;
  environment: 'all' | 'production' | 'preview' | 'development' | string;
  created_at: string;
}

// Deployment DTOs
export type DeploymentStatus =
  | 'Queued'
  | 'Building'
  | 'Deploying'
  | 'Running'
  | 'Success'
  | 'Failed';

export interface DeploymentDTO {
  id: string;
  project_id: string;
  deployment_number: number;
  status: DeploymentStatus;
  branch: string;
  commit_sha: string;
  triggered_by: string;
  created_at: string;
  updated_at?: string;
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

// Dashboard Aggregator DTO
export interface DashboardMetricsDTO {
  total_projects: number;
  active_deployments: number;
  success_rate_percent: number;
  total_organizations: number;
  recent_deployments: DeploymentDTO[];
}
