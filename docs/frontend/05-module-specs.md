# Frontend Module Specifications & Complete API DTO Payload Reference

> **Document:** Frontend Module Specifications & API DTO Reference  
> **Version:** 2.0.0  
> **Backend API Spec:** OpenAPI 3.0.3 (`docs/system/05-api/openapi.yaml`)  
> **Scope:** Full Request & Response DTO JSON Payloads, TypeScript interfaces, Zod Schemas, HTTP methods, and query parameters across all 10 domain modules  

---

## 1. Overview & Standard API Response Envelope

All REST API endpoints in the Forge Axum backend return responses wrapped in a standard JSON envelope:

```typescript
export interface ApiResponse<T> {
  status: "success" | "error";
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
```

---

## 2. Module Specifications & Payload Catalog

---

### Module 01 — Authentication & Session Management

#### 1. Register User Account
- **Endpoint:** `POST /api/v1/auth/register`
- **Request Body (`RegisterRequest`):**
  ```json
  {
    "name": "Monirul Islam",
    "email": "monirul@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "message": "User registered successfully.",
    "data": {
      "id": "456e7890-e89b-12d3-a456-426614174000",
      "name": "Monirul Islam",
      "email": "monirul@example.com",
      "is_active": true,
      "created_at": "2026-09-24T00:00:00Z",
      "updated_at": "2026-09-24T00:00:00Z"
    }
  }
  ```

#### 2. User Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Request Body (`LoginRequest`):**
  ```json
  {
    "email": "monirul@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Login successful.",
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "def45689-e89b-12d3-a456-426614174000",
      "token_type": "Bearer",
      "expires_in": 900,
      "user": {
        "id": "456e7890-e89b-12d3-a456-426614174000",
        "name": "Monirul Islam",
        "email": "monirul@example.com",
        "roles": ["User"]
      }
    }
  }
  ```

#### 3. Refresh Access Token
- **Endpoint:** `POST /api/v1/auth/refresh`
- **Request Body (`RefreshTokenRequest`):**
  ```json
  {
    "refresh_token": "def45689-e89b-12d3-a456-426614174000"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Token refreshed successfully.",
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new...",
      "refresh_token": "new-refresh-token-uuid-12345",
      "token_type": "Bearer",
      "expires_in": 900
    }
  }
  ```

---

### Module 02 — User Profile Settings

#### 1. Get User Profile (`GET /api/v1/users/me`)
- **Headers:** `Authorization: Bearer <access_token>`
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "message": "User profile fetched successfully",
    "data": {
      "id": "456e7890-e89b-12d3-a456-426614174000",
      "user_id": "456e7890-e89b-12d3-a456-426614174000",
      "first_name": "Monirul",
      "last_name": "Islam",
      "phone": "+1234567890",
      "dob": "1995-05-15",
      "gender": "male",
      "image": "https://cdn.forge.dev/avatars/monirul.png",
      "created_at": "2026-09-24T00:00:00Z"
    }
  }
  ```

#### 2. Update User Profile (`PUT /api/v1/users/profile`)
- **Request Body (`UpdateProfileRequest`):**
  ```json
  {
    "first_name": "Monirul",
    "last_name": "Islam",
    "phone": "+1987654321",
    "dob": "1995-05-15",
    "gender": "male",
    "image": "https://cdn.forge.dev/avatars/new-monirul.png"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Profile updated successfully",
    "data": {
      "id": "456e7890-e89b-12d3-a456-426614174000",
      "user_id": "456e7890-e89b-12d3-a456-426614174000",
      "first_name": "Monirul",
      "last_name": "Islam",
      "phone": "+1987654321",
      "dob": "1995-05-15",
      "gender": "male",
      "image": "https://cdn.forge.dev/avatars/new-monirul.png"
    }
  }
  ```

---

### Module 03 — Organizations & Tenant Management

#### 1. List User Organizations (`GET /api/v1/organizations`)
- **Query Parameters:** `?page=1&page_size=10`
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Organizations fetched successfully",
    "data": {
      "items": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "Acme Corp",
          "slug": "acme-corp",
          "type": "Company",
          "description": "Enterprise cloud platform organization",
          "logo": "https://cdn.forge.dev/logos/acme.png",
          "owner_user_id": "456e7890-e89b-12d3-a456-426614174000",
          "created_at": "2026-09-24T00:00:00Z"
        }
      ],
      "total_items": 1,
      "page": 1,
      "page_size": 10,
      "total_pages": 1
    }
  }
  ```

#### 2. Create Organization (`POST /api/v1/organizations`)
- **Request Body (`CreateOrganizationRequest`):**
  ```json
  {
    "name": "DevOps Engineers Inc",
    "slug": "devops-engineers",
    "type": "Company",
    "description": "High performance software development org",
    "logo": "https://cdn.forge.dev/logos/devops.png"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "message": "Organization created successfully",
    "data": {
      "id": "987f6543-e89b-12d3-a456-426614174000",
      "name": "DevOps Engineers Inc",
      "slug": "devops-engineers",
      "type": "Company",
      "description": "High performance software development org",
      "logo": "https://cdn.forge.dev/logos/devops.png",
      "owner_user_id": "456e7890-e89b-12d3-a456-426614174000",
      "created_at": "2026-09-24T00:00:00Z"
    }
  }
  ```

#### 3. Invite Member (`POST /api/v1/organizations/:id/invitations`)
- **Request Body (`InviteMemberRequest`):**
  ```json
  {
    "email": "developer@example.com",
    "role": "Developer"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "message": "Invitation sent successfully",
    "data": {
      "id": "777e4567-e89b-12d3-a456-426614174000",
      "organization_id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "developer@example.com",
      "role": "Developer",
      "token": "inv_token_999888777",
      "expires_at": "2026-10-01T00:00:00Z"
    }
  }
  ```

---

### Module 04 — Teams Management

#### 1. List Organization Teams (`GET /api/v1/teams?org_id=:orgId`)
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Teams fetched successfully",
    "data": {
      "items": [
        {
          "id": "333e4567-e89b-12d3-a456-426614174000",
          "name": "Backend Core Team",
          "description": "Rust and Axum services development team",
          "org_id": "123e4567-e89b-12d3-a456-426614174000",
          "member_count": 5,
          "created_at": "2026-09-24T00:00:00Z"
        }
      ],
      "total_items": 1,
      "page": 1,
      "page_size": 10,
      "total_pages": 1
    }
  }
  ```

#### 2. Create Team (`POST /api/v1/teams`)
- **Request Body (`CreateTeamRequest`):**
  ```json
  {
    "name": "Frontend Team",
    "description": "Next.js and React dashboard development",
    "org_id": "123e4567-e89b-12d3-a456-426614174000"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "message": "Team created successfully",
    "data": {
      "id": "444e4567-e89b-12d3-a456-426614174000",
      "name": "Frontend Team",
      "description": "Next.js and React dashboard development",
      "org_id": "123e4567-e89b-12d3-a456-426614174000",
      "created_at": "2026-09-24T00:00:00Z"
    }
  }
  ```

---

### Module 05 — Projects & Environment Variables

#### 1. Create Project (`POST /api/v1/projects`)
- **Request Body (`CreateProjectRequest`):**
  ```json
  {
    "name": "forge-api-gateway",
    "description": "Core Rust backend platform service",
    "organization_id": "123e4567-e89b-12d3-a456-426614174000",
    "project_type": "repo",
    "runtime": "rust"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "message": "Project created successfully",
    "data": {
      "id": "555e4567-e89b-12d3-a456-426614174000",
      "name": "forge-api-gateway",
      "slug": "forge-api-gateway",
      "description": "Core Rust backend platform service",
      "organization_id": "123e4567-e89b-12d3-a456-426614174000",
      "owner_id": "456e7890-e89b-12d3-a456-426614174000",
      "project_type": "repo",
      "runtime": "rust",
      "created_at": "2026-09-24T00:00:00Z"
    }
  }
  ```

#### 2. Bulk Create Environment Variables (`POST /api/v1/projects/:id/environment-variables/bulk`)
- **Request Body (`BulkCreateEnvVarsRequest`):**
  ```json
  {
    "variables": [
      {
        "key": "DATABASE_URL",
        "value": "postgres://user:pass@localhost:5432/forge_db",
        "environment": "all"
      },
      {
        "key": "JWT_SECRET",
        "value": "super-secret-jwt-key-2026",
        "environment": "production"
      }
    ]
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "message": "Environment variables created successfully",
    "data": [
      {
        "id": "111e4567-e89b-12d3-a456-426614174000",
        "project_id": "555e4567-e89b-12d3-a456-426614174000",
        "key": "DATABASE_URL",
        "masked_value": "••••••••••••••••",
        "environment": "all",
        "created_at": "2026-09-24T00:00:00Z"
      },
      {
        "id": "222e4567-e89b-12d3-a456-426614174000",
        "project_id": "555e4567-e89b-12d3-a456-426614174000",
        "key": "JWT_SECRET",
        "masked_value": "••••••••••••••••",
        "environment": "production",
        "created_at": "2026-09-24T00:00:00Z"
      }
    ]
  }
  ```

---

### Module 06 — Deployments Engine & SSE Build Console

#### 1. Trigger Deployment (`POST /api/v1/projects/:id/deployments`)
- **Request Body (`TriggerDeploymentRequest`):**
  ```json
  {
    "branch": "main",
    "commit_sha": "a1b2c3d4e5f67890"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "message": "Deployment triggered successfully",
    "data": {
      "id": "888e4567-e89b-12d3-a456-426614174000",
      "project_id": "555e4567-e89b-12d3-a456-426614174000",
      "deployment_number": 104,
      "status": "Queued",
      "branch": "main",
      "commit_sha": "a1b2c3d4e5f67890",
      "triggered_by": "456e7890-e89b-12d3-a456-426614174000",
      "created_at": "2026-09-24T00:00:00Z"
    }
  }
  ```

#### 2. Real-Time SSE Build Log Stream
- **Endpoint:** `GET /api/v1/projects/:id/deployments/:depId/logs/stream?token=<jwt>`
- **SSE Event Stream Data Payload Format:**
  ```text
  event: log
  data: {"timestamp": "2026-09-24T00:00:01Z", "level": "INFO", "message": "[1/5] Cloning repository from branch 'main'..."}

  event: log
  data: {"timestamp": "2026-09-24T00:00:04Z", "level": "INFO", "message": "[2/5] Validating Rust build manifest (Cargo.toml)..."}

  event: log
  data: {"timestamp": "2026-09-24T00:00:12Z", "level": "INFO", "message": "[3/5] Executing cargo build --release..."}

  event: status
  data: {"status": "Building", "deployment_id": "888e4567-e89b-12d3-a456-426614174000"}
  ```

---

### Module 07 — Dashboard Aggregator & Health Probes

#### 1. Fetch Dashboard Metrics (`GET /api/v1/dashboard`)
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Dashboard metrics fetched successfully",
    "data": {
      "total_projects": 12,
      "active_deployments": 4,
      "success_rate_percent": 98.4,
      "total_organizations": 3,
      "recent_deployments": [
        {
          "id": "888e4567-e89b-12d3-a456-426614174000",
          "project_name": "forge-api-gateway",
          "status": "Running",
          "commit_sha": "a1b2c3d4",
          "duration_seconds": 42,
          "created_at": "2026-09-24T00:00:00Z"
        }
      ]
    }
  }
  ```

#### 2. System Readiness Probe (`GET /health` or `/api/v1/health`)
- **Success Response (200 OK):**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-09-24T00:00:00Z",
    "services": {
      "database": {
        "status": "ok",
        "latency_ms": 1.2
      }
    }
  }
  ```
