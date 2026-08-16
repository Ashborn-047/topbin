## 2024-08-16 - Prevent Path Traversal in Data Ingestion Scripts
**Vulnerability:** A path traversal check in `scripts/ingest-clubs.js` incorrectly validated user-supplied paths against the repository root (`ROOT`), allowing an attacker to read/write arbitrary files within the repository (like `package.json`).
**Learning:** Checking paths against the project root in an application that takes command-line path arguments provides insufficient isolation and defeats the purpose of the check.
**Prevention:** Always validate resolved user paths against the most restrictive directory intended for the operation (e.g., `data/`), not the generic project root. Use `path.resolve` and append `path.sep` to prevent directory name overlap attacks.
