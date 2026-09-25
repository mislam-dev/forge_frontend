# Spec Delta: foundations-theme

## MODIFIED Requirements

### Requirement: Design Token HSL Variables and Palette
The application styles SHALL define CSS custom properties in HSL format for semantic surfaces, foregrounds, borders, radii, and all six deployment status lifecycle states in both light and dark themes, compiled and served via the Tailwind CSS pipeline so that all styled surfaces and utility classes render in the browser.

#### Scenario: Dark theme token evaluation
- **WHEN** the document root element is assigned class `dark`
- **THEN** theme variables (`--background`, `--card`, `--primary`, `--status-*`) evaluate to high-contrast dark mode HSL values

#### Scenario: Browser stylesheet rendering
- **WHEN** any page loads in a web browser
- **THEN** CSS variables and utility classes are actively compiled and applied to document elements with visible layout and colors
