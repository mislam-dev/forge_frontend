# api-transport Specification

## Purpose
Defines the centralized HTTP transport layer, automated JWT token refresh cycle, real-time Server-Sent Events streaming hook, TanStack Query provider, and strongly typed API Data Transfer Objects.

## Requirements

### Requirement: Centralized Axios Client and Request Headers
The application SHALL provide a singleton Axios HTTP client configured with environment-driven base URL, standard request timeouts, Bearer token injection, unique UUID `x-request-id` headers, and conditional `Organization-ID` headers on every outgoing request, rejecting failed requests with normalized network error envelopes and prohibiting synthetic mock data fallbacks.

#### Scenario: Outgoing authenticated request
- **WHEN** any HTTP request is dispatched through the central API client
- **THEN** an `x-request-id` UUID header is appended, and an `Authorization: Bearer <token>` header is attached if a valid access token is present in storage

#### Scenario: Attaching Organization-ID header for active organization
- **WHEN** an HTTP request is dispatched and an organization is currently selected in the active workspace
- **THEN** the request SHALL include the `Organization-ID` header set to the active organization identifier

#### Scenario: Omitting Organization-ID header for personal profile
- **WHEN** an HTTP request is dispatched and the user's personal profile context is active (no organization selected)
- **THEN** the request SHALL NOT include an `Organization-ID` header

#### Scenario: Handling network connectivity failure
- **WHEN** an HTTP request fails due to network outage, DNS failure, server downtime, or connection refusal
- **THEN** the Axios client SHALL normalize the error into a structured error envelope with `code: 'ERR_NETWORK'` and a descriptive message indicating backend unavailability, rejecting the promise without returning mock data

### Requirement: Automated 401 Token Refresh Queue
The application SHALL intercept HTTP 401 Unauthorized responses, pause concurrent in-flight requests in a promise queue, attempt silent token refresh against `/api/v1/auth/refresh`, and replay queued requests with the updated token upon success.

#### Scenario: Successful token refresh during concurrent requests
- **WHEN** one or more requests fail with HTTP 401 and a refresh token exists
- **THEN** the client executes a single token refresh request, updates persisted tokens, resolves all queued requests with the new credentials, and retries the original calls without surfacing an error to the caller

#### Scenario: Expired or invalid refresh token
- **WHEN** a token refresh request fails or no refresh token is present in storage
- **THEN** the client rejects all pending queued requests, purges stored authentication tokens, and redirects the browser to the login route

### Requirement: Real-Time SSE Log Streaming Hook
The application SHALL provide a React hook (`useSseStream`) that connects to Server-Sent Event log endpoints, parses incoming log chunks, maintains a memory-bounded line buffer, and handles connection disconnects with exponential retry backoff.

#### Scenario: Live log chunk ingestion
- **WHEN** an SSE connection receives newline-delimited build or deployment log data
- **THEN** the hook appends the new lines to the active log state while maintaining buffer size limits (up to 5,000 lines) to prevent browser memory exhaustion

#### Scenario: Server connection drop and reconnect
- **WHEN** an active SSE connection closes unexpectedly or encounters a network error
- **THEN** the hook transitions connection status to error/reconnecting and attempts automatic reconnection with exponential backoff

### Requirement: Global Query Client Provider
The application SHALL provide a `QueryProvider` wrapping the root component tree with a configured TanStack Query client establishing default query caching stale times, retry counts, and window focus refetching policies.

#### Scenario: Rendering query-dependent application trees
- **WHEN** child components use query or mutation hooks within the application tree
- **THEN** the `QueryProvider` supplies a configured `QueryClient` context avoiding redundant background network fetches

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

### Requirement: Standardized Route Prefix and API Client Configuration
The Axios client SHALL standardize on the `/api/v1` base route prefix matching the Axum backend OpenAPI specification while supporting local proxy development and environment configuration.

#### Scenario: Dispatching API v1 requests
- **WHEN** hooks or components issue requests via the API client
- **THEN** requests are routed through `/api/v1/*` with standardized headers including `x-request-id` and Bearer token when authenticated
