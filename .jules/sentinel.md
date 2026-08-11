## 2024-05-24 - Restrict Path Traversal to Specific Data Directories
**Vulnerability:** The script `scripts/ingest-clubs.js` checked if resolved paths started with `ROOT + path.sep`, allowing arbitrary file writes anywhere in the repository.
**Learning:** Validating against a repository root still exposes configuration files, scripts, and source code to overwriting.
**Prevention:** Use `path.resolve(ROOT, userPath)` and strictly verify that the resolved path starts with the most restrictive intended directory (e.g., a specific `data/` subdirectory rather than the generic repository `ROOT`) appended with `path.sep`.
