# Spec Delta

## ADDED Requirements

### Requirement: Authenticated User Identity Retrieval
The application SHALL retrieve the currently authenticated user's identity details from `GET /api/v1/auth/me` when an active authentication session exists, returning a `MeResponseDto` structure with `id` (UUID), `name`, and `email`.

#### Scenario: Successful current user retrieval
- **WHEN** an authenticated client issues a request to fetch current user identity
- **THEN** the application dispatches an HTTP GET to `/api/v1/auth/me` with Bearer token authentication and receives `MeResponseDto` containing the user's `id`, `name`, and `email`

#### Scenario: Unauthenticated current user retrieval attempt
- **WHEN** an unauthenticated client or expired session issues a request to `/api/v1/auth/me`
- **THEN** the request fails with HTTP 401 Unauthorized and triggers session cleanup or redirect to `/login`
