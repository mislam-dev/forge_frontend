# Spec Delta: auth-routing

## Purpose

Secures private application routes using Next.js Edge Middleware and provides public user authentication, registration, and password recovery interfaces.

## ADDED Requirements

### Requirement: Edge Middleware Authentication Guard
The application SHALL execute an edge middleware guard on incoming HTTP requests that verifies the presence of an active authentication token cookie (`forge_access_token`) before allowing access to protected workspace routes.

#### Scenario: Unauthenticated access to protected route
- **WHEN** an unauthenticated visitor navigates to `/dashboard`, `/organizations`, `/teams`, `/projects`, `/notifications`, or `/settings`
- **THEN** the middleware intercepts the request and redirects to `/login` with the original pathname preserved in a `redirect` query parameter

#### Scenario: Authenticated access to auth route
- **WHEN** a user possessing a valid `forge_access_token` cookie visits `/login` or `/register`
- **THEN** the middleware redirects the user directly to `/dashboard`

### Requirement: User Authentication Credentials Flow
The application SHALL provide a login page at `/login` accepting user email and password credentials, validating format client-side, persisting authentication tokens to storage and cookies upon success, and navigating to the specified redirect destination.

#### Scenario: Successful login with redirect target
- **WHEN** a user enters valid login credentials and submits the login form
- **THEN** access and refresh tokens are stored in browser storage and cookie, and the user is redirected to the URL provided in the `redirect` query parameter (or `/dashboard` if unspecified)

#### Scenario: Invalid login credentials
- **WHEN** a user submits incorrect authentication credentials
- **THEN** an error message is presented to the user and the form remains editable without navigating away

### Requirement: User Account Registration
The application SHALL provide a registration page at `/register` requiring user name, email, and a secure password satisfying minimum complexity rules before dispatching an account creation request.

#### Scenario: Form validation on weak password
- **WHEN** a user enters a password shorter than 8 characters or missing required symbol characters
- **THEN** the form displays specific inline validation warnings and prevents submission

### Requirement: Self-Service Password Recovery
The application SHALL provide password reset request (`/forgot-password`) and confirmation (`/reset-password`) pages allowing users to request password recovery tokens and submit replacement credentials.

#### Scenario: Requesting password reset instructions
- **WHEN** a user submits a registered email address on the forgot-password page
- **THEN** a confirmation state is displayed notifying the user that recovery instructions have been dispatched
