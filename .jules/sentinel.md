## 2026-08-10 - Fix Path Traversal in Ingest Clubs Script
**Vulnerability:** `scripts/ingest-clubs.js` allowed arbitrary read/write access to any file within the repository root (e.g., `.env`, `package.json`) by only validating that the resolved paths start with `ROOT`.
**Learning:** Validating that a path is simply within the project root is insufficient if the script only needs to access a specific subdirectory. This overly broad validation enables localized path traversal.
**Prevention:** Always validate resolved paths against the most restrictive directory required for the operation (e.g., `data/clubs/` rather than the generic repository `ROOT`).
