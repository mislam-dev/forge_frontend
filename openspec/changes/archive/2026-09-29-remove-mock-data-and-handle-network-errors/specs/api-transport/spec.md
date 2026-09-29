# Spec Delta: api-transport

## MODIFIED Requirements

### Requirement: Centralized Axios Client and Request Headers
The application SHALL provide a singleton Axios HTTP client configured with environment-driven base URL, standard request timeouts, Bearer token injection, and unique UUID `x-request-id` headers on every outgoing request, rejecting failed requests with normalized network error envelopes and prohibiting synthetic mock data fallbacks.

#### Scenario: Outgoing authenticated request
- **WHEN** any HTTP request is dispatched through the central API client
- **THEN** an `x-request-id` UUID header is appended, and an `Authorization: Bearer <token>` header is attached if a valid access token is present in storage

#### Scenario: Handling network connectivity failure
- **WHEN** an HTTP request fails due to network outage, DNS failure, server downtime, or connection refusal
- **THEN** the Axios client SHALL normalize the error into a structured error envelope with `code: 'ERR_NETWORK'` and a descriptive message indicating backend unavailability, rejecting the promise without returning mock data
