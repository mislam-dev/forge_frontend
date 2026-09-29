# Proposal: Fix Project Runtime and Type Variant Serialization

## Why
When creating a project via `POST /api/v1/projects`, the backend Axum API fails with a JSON deserialization error (`Failed to deserialize the JSON body into the target type: runtime: unknown variant node, expected one of NodeJs, Python, Go, Static`). The backend Rust models use Serde with PascalCase variants (`ProjectRuntime::{NodeJs, Python, Go, Static}` and `ProjectTypes::{Repo, Files}`), whereas the frontend project creation wizard and validation schemas send lowercase variants (`node`, `rust`, `docker`, `repo`, `dockerfile`). Aligning the frontend runtime models, validation schemas, wizard selectors, and project listing filters with the backend Serde enum variants is required for successful project creation.

## What Changes
- **Runtime & Project Type DTOs**: Update `ProjectRuntime` (`'NodeJs' | 'Python' | 'Go' | 'Static'`) and `ProjectType` (`'Repo' | 'Files'`) in `src/lib/api/types.ts` to strictly match the backend Rust enum serialization contract while preserving normalization helpers for user-facing labels.
- **Validation Schemas**: Update `projectStep1Schema` in `src/lib/validation/projects.ts` to validate the backend-supported runtime variants (`NodeJs`, `Python`, `Go`, `Static`) and project types (`Repo`, `Files`).
- **Project Creation Wizard**: Update `NewProjectWizard.tsx` default values, runtime cards, and submission payloads to display clean labels ("Node.js", "Python", "Go", "Static Site") while serializing the exact expected variant values (`NodeJs`, `Python`, `Go`, `Static`).
- **Project Directory Filtering**: Update `projects/page.tsx` runtime filters and runtime badge rendering to match the supported backend runtimes.
- **Mock Adapter & Seeds**: Update `src/lib/api/mock/seeds.ts` and `src/lib/api/mock/adapter.ts` to use `NodeJs`, `Python`, `Go`, `Static` and `Repo`, `Files` so mock mode operates identically to the live backend.

## Capabilities

### Modified Capabilities
- `domain-modules`: Update `Multi-Step Project Creation Wizard` and `Project Listing and Filtering` requirements to reflect the backend-supported runtime options (`NodeJs`, `Python`, `Go`, `Static`) and project types (`Repo`, `Files`).

## Impact
- **Affected Code**: `src/lib/api/types.ts`, `src/lib/validation/projects.ts`, `src/components/projects/NewProjectWizard.tsx`, `src/app/(dashboard)/projects/page.tsx`, `src/components/projects/ProjectHeader.tsx`, `src/lib/api/mock/adapter.ts`, `src/lib/api/mock/seeds.ts`.
- **APIs**: Fixes `POST /api/v1/projects` payload serialization.
- **Dependencies**: No new dependencies required.
