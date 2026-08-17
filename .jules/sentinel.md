## 2024-05-24 - Path Traversal in Ingestion Script
**Vulnerability:** Path traversal vulnerability in `scripts/ingest-clubs.js` where user input was only validated to be within the generic repository `ROOT` rather than the intended `data/` subdirectory.
**Learning:** Validating paths against a broad directory like `ROOT` is insufficient and allows attackers to read or overwrite critical files like `.env`, `package.json`, or the scripts themselves.
**Prevention:** Use `path.resolve(ROOT, userPath)` and strictly verify that the resolved path starts with the most restrictive intended directory (e.g., a specific `data/` subdirectory) appended with `path.sep`.
