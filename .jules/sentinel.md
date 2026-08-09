## 2026-08-09 - Path Traversal in ingest-clubs.js
**Vulnerability:** The script validated that user-provided paths started with the repository ROOT, which still allowed reading and overwriting arbitrary files within the repository (like package.json).
**Learning:** Using `startsWith(ROOT + path.sep)` is insufficient if the script should only operate on a specific data directory. It allows path traversal up to the root level.
**Prevention:** Use `path.resolve(ROOT, userPath)` and strictly verify that the resolved path starts with the most restrictive intended directory (e.g., a specific data/ subdirectory) appended with path.sep.
