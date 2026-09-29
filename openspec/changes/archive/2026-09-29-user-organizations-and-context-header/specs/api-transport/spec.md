# Spec Delta

## MODIFIED Requirements

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
