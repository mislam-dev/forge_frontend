# Spec Delta: domain-modules

## MODIFIED Requirements

### Requirement: Project Listing and Filtering
The system SHALL display all projects accessible to the active organization with real-time text filtering, runtime framework badges, git repository metadata, and last deployed timestamps, supporting filtering across backend runtime variants (`NodeJs`, `Python`, `Go`, `Static`).

#### Scenario: Filtering projects by keyword
- **WHEN** a user enters a search query in the project search input
- **THEN** the system SHALL immediately filter the project list matching the project name or repository URL without full page reload.

#### Scenario: Empty project state
- **WHEN** no projects exist for the selected organization
- **THEN** the system SHALL display an informative empty state card prompting the user to create their first project.

#### Scenario: Filtering projects by runtime variant
- **WHEN** a user selects a runtime filter badge (`NodeJs`, `Python`, `Go`, `Static`)
- **THEN** the system SHALL filter the project cards matching the selected runtime variant.

### Requirement: Multi-Step Project Creation Wizard
The system SHALL provide a guided 3-step wizard at `/projects/new` to create a project, configure repository source and branch, and optionally declare initial environment variables, using React Hook Form and Zod schemas with inline error messages and no native browser validation, restricting selectable runtimes to backend-supported variants (`NodeJs`, `Python`, `Go`, `Static`) and project types (`Repo`, `Files`) and serializing them matching the Axum backend Serde enum variants.

#### Scenario: Advancing through wizard steps with validation
- **WHEN** a user enters a valid project name and runtime and clicks "Next"
- **THEN** the system SHALL advance to the Git repository configuration step and validate repository URL and default branch before allowing progression to environment variables.

#### Scenario: Validation failure on project wizard step
- **WHEN** a user submits step 1 or step 2 with missing or invalid fields
- **THEN** the system SHALL prevent navigation to the next step, suppress native browser validation popups, and display inline field error messages styled with the theme's destructive token.

#### Scenario: Successful project creation
- **WHEN** a user completes all required wizard fields and submits the form
- **THEN** the system SHALL invoke the project creation API, display a success toast, and redirect the user to the newly created project overview page.

#### Scenario: Validating and serializing supported runtime variants
- **WHEN** a user selects a runtime from the wizard card grid (such as Node.js, Python, Go, or Static Site)
- **THEN** the system SHALL serialize the payload as the expected PascalCase variant (`NodeJs`, `Python`, `Go`, `Static`) and project type (`Repo`, `Files`) without casing discrepancies.
