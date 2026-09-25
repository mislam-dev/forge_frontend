# api-transport Specification

## Purpose
Defines the centralized HTTP transport layer, automated JWT token refresh cycle, real-time Server-Sent Events streaming hook, TanStack Query provider, and strongly typed API Data Transfer Objects.

## Requirements

### Requirement: Centralized Axios Client and Request Headers
The application SHALL provide a singleton Axios HTTP client configured with environment-driven base URL, standard request timeouts, Bearer token injection, and unique UUID `x-request-id` headers on every outgoing request.

#### Scenario: Outgoing authenticated request
- **WHEN** any HTTP request is dispatched through the central API client
- **THEN** an `x-request-id` UUID header is appended, and an `Authorization: Bearer <token>` header is attached if a valid access token is present in storage

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
The application SHALL define comprehensive TypeScript types and interfaces for generic API responses (`ApiResponse<T>`, `PaginatedResponse<T>`) and domain DTOs (`UserDTO`, `AuthTokensDTO`, `ProjectDTO`, `DeploymentDTO`, `OrganizationDTO`).

#### Scenario: Unwrapping structured backend responses
- **WHEN** the client receives a structured JSON payload from the backend API
- **THEN** TypeScript compiler enforces strict typing on payload metadata (`status`, `message`) and inner domain `data` structures
