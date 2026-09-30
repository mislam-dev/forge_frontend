# Spec Delta

## MODIFIED Requirements

### Requirement: Typed API and Domain Data Transfer Objects
The application SHALL define comprehensive TypeScript types and interfaces conforming to the OpenAPI 3.0 specification (`docs/api/openapi.yaml`) and Axum backend DTOs for standard response envelopes (`ApiResponse<T>`, `ApiPaginatedResponse<T>`, `ApiErrorResponse`) and domain DTOs (`UserDTO`, `MeResponseDto`, `AuthTokensDTO`, `ProjectDTO`, `DeploymentDTO`, `OrganizationDTO`, `TeamDTO`, `EnvironmentVariableDTO`, `ProjectRepositoryDTO`, `NotificationDTO`, `RoleDTO`, `PermissionDTO`).

#### Scenario: Unwrapping structured backend responses
- **WHEN** the client receives a structured JSON payload from the backend API
- **THEN** the TypeScript compiler enforces strict typing on payload metadata (`message`, `data`, and optional `pagination: { page, limit, total }`) and structured error envelopes (`is_error: true`, `code`, `message`, `errors`)

#### Scenario: Intercepting API errors
- **WHEN** an API request fails with a 4xx or 5xx status code containing an error envelope
- **THEN** the transport layer preserves structured error details (`code`, `errors` map) for consumer form and notification handlers

#### Scenario: Decoding current user identity DTO
- **WHEN** the client receives a response from the current user endpoint (`/api/v1/auth/me`)
- **THEN** the TypeScript compiler enforces strict typing conforming to `MeResponseDto` with required `id` (UUID string), `name` (string), and `email` (string)
