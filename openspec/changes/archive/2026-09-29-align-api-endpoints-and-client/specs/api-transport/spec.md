# Spec Delta: api-transport

## MODIFIED Requirements

### Requirement: Typed API and Domain Data Transfer Objects
The application SHALL define comprehensive TypeScript types and interfaces conforming to the OpenAPI 3.0 specification (`docs/api/openapi.yaml`) for standard response envelopes (`ApiResponse<T>`, `ApiPaginatedResponse<T>`, `ApiErrorResponse`) and domain DTOs (`UserDTO`, `AuthTokensDTO`, `ProjectDTO`, `DeploymentDTO`, `OrganizationDTO`, `TeamDTO`, `EnvironmentVariableDTO`, `ProjectRepositoryDTO`, `NotificationDTO`, `RoleDTO`, `PermissionDTO`).

#### Scenario: Unwrapping structured backend responses
- **WHEN** the client receives a structured JSON payload from the backend API
- **THEN** the TypeScript compiler enforces strict typing on payload metadata (`message`, `data`, and optional `pagination: { page, limit, total }`) and structured error envelopes (`is_error: true`, `code`, `message`, `errors`)

#### Scenario: Intercepting API errors
- **WHEN** an API request fails with a 4xx or 5xx status code containing an error envelope
- **THEN** the transport layer preserves structured error details (`code`, `errors` map) for consumer form and notification handlers

## ADDED Requirements

### Requirement: Standardized Route Prefix and API Client Configuration
The Axios client SHALL standardize on the `/api/v1` base route prefix matching the Axum backend OpenAPI specification while supporting local proxy development and environment configuration.

#### Scenario: Dispatching API v1 requests
- **WHEN** hooks or components issue requests via the API client
- **THEN** requests are routed through `/api/v1/*` with standardized headers including `x-request-id` and Bearer token when authenticated
