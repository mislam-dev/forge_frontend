# Spec Delta

## MODIFIED Requirements

### Requirement: Real-Time Deployment Log Streaming and Build Console
The system SHALL provide an interactive build console at `/projects/[id]/deployments/[depId]` rendering streaming Server-Sent Events (SSE) build logs via `/api/v1/deployments/:id/logs/stream`, query stored logs via `/api/v1/deployments/:id/logs`, keyword search logs via `/api/v1/deployments/:id/logs/search`, download raw logs via `/api/v1/deployments/:id/logs/download`, and deployment control actions (cancel and redeploy), without executing background short polling on deployment records.

#### Scenario: Streaming live logs over SSE
- **WHEN** a user opens an active deployment page
- **THEN** the system SHALL establish an EventSource connection to the log stream endpoint `/api/v1/deployments/:id/logs/stream` and append incoming log chunks into `SseLogViewer` in real-time.

#### Scenario: Viewing deployment logs without short polling
- **WHEN** a user navigates to `/projects/[id]/deployments/[depId]` to view build logs
- **THEN** the system SHALL perform an initial query for deployment metadata and SHALL NOT execute recurring short polling queries against `/api/v1/deployments/:id`.

#### Scenario: Triggering redeployment
- **WHEN** a user clicks the "Redeploy" button
- **THEN** the system SHALL submit `POST /api/v1/deployments/:id/redeploy`, present a notification, and redirect to the newly queued deployment console.

#### Scenario: Searching historical build logs
- **WHEN** a user enters a search term in the deployment log search bar
- **THEN** the system SHALL dispatch `GET /api/v1/deployments/:id/logs/search?q=...` and display matched lines with line context.

#### Scenario: Downloading raw deployment log file
- **WHEN** a user clicks "Download Logs"
- **THEN** the browser triggers download of `/api/v1/deployments/:id/logs/download` as a `.log` attachment.
