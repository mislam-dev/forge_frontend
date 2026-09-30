# Spec Delta

## MODIFIED Requirements

### Requirement: Typed API and Domain Data Transfer Objects
The application SHALL define comprehensive TypeScript types and interfaces conforming to the OpenAPI 3.0 specification (`docs/api/openapi.yaml`) and Axum backend DTOs for standard response envelopes (`ApiResponse<T>`, `ApiPaginatedResponse<T>`, `ApiErrorResponse`), health check probe responses (`HealthLiveDTO`, `HealthReadyDTO`, `HealthCheckItem`, `HealthDeepDTO`), and domain DTOs (`UserDTO`, `MeResponseDto`, `AuthTokensDTO`, `ProjectDTO`, `DeploymentDTO`, `OrganizationDTO`, `TeamDTO`, `EnvironmentVariableDTO`, `ProjectRepositoryDTO`, `NotificationDTO`, `RoleDTO`, `PermissionDTO`).

#### Scenario: Unwrapping structured backend responses
- **WHEN** the client receives a structured JSON payload from the backend API
- **THEN** the TypeScript compiler enforces strict typing on payload metadata (`message`, `data`, and optional `pagination: { page, limit, total }`) and structured error envelopes (`is_error: true`, `code`, `message`, `errors`)

#### Scenario: Intercepting API errors
- **WHEN** an API request fails with a 4xx or 5xx status code containing an error envelope
- **THEN** the transport layer preserves structured error details (`code`, `errors` map) for consumer form and notification handlers

#### Scenario: Decoding current user identity DTO
- **WHEN** the client receives a response from the current user endpoint (`/api/v1/auth/me`)
- **THEN** the TypeScript compiler enforces strict typing conforming to `MeResponseDto` with required `id` (UUID string), `name` (string), and `email` (string)

#### Scenario: Decoding liveness probe response
- **WHEN** the client issues a request to `/health/live` (or `/api/v1/health/live`)
- **THEN** the client receives an unwrapped JSON payload typed as `HealthLiveDTO` containing `status` (string, e.g. "healthy"), `service` (string), `version` (string), `environment` (string), and `timestamp` (ISO 8601 string) without requiring authentication

#### Scenario: Decoding readiness probe response
- **WHEN** the client issues a request to `/health/ready` (or `/api/v1/health/ready`)
- **THEN** the client receives a payload typed as `HealthReadyDTO` containing `status` ("ready" on HTTP 200 or "not_ready" on HTTP 503), `service` (string), `timestamp` (ISO 8601 string), and `checks` containing status and latency metrics for core dependencies (`database`, `job_queue`, `container_runtime`)

#### Scenario: Decoding deep health check response
- **WHEN** an authenticated system administrator issues a request to `/health/deep` (or `/api/v1/health/deep`) with an optional `timeout_ms` parameter
- **THEN** the client attaches Bearer authentication and receives a payload typed as `HealthDeepDTO` containing `status` (string), `service` (string), `version` (string), `environment` (string), `uptime_seconds` (number), and `timestamp` (ISO 8601 string)
