You are helping update THIS repository’s documentation. Ultrathink.

Goals:

- Keep all documentation in README.md as the single source of truth.
- Use the existing README.md as the PRIMARY source of truth.
- VALIDATE every section; FLAG or FIX anything deprecated or incorrect.
- Reorganize into this structure (create sections if missing):
  1. Overview
  2. Setup (prereqs, install, run, common pitfalls)
  3. Testing (unit + functional, coverage, troubleshooting)
  4. Architecture (directory layout, stack, integrations/flows)
  5. Endpoints (routes, methods, purpose, auth/flags notes)
  6. References/Links

Strict rules:

- **Preserve all existing images, screenshots, and diagrams exactly as they are. Never remove or drop them.**
- Cross-check commands and scripts against package.json and repo code.
- Keep commands copy-paste runnable; mark uncertain bits as “Needs verification”.
- Do NOT introduce new secrets or internal hostnames that aren't already present in the existing README — this doesn't mean stripping internal URLs/hostnames the README already documents (e.g. devbox/testbox addresses) when "use the existing README as the PRIMARY source of truth" says to keep them.
- Keep it concise and actionable.
- Also update CLAUDE.md with any new relevant info that will help future documentation tasks.
