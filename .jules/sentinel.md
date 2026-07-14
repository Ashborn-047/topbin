## 2024-07-14 - Path Traversal Prevention Pattern
**Vulnerability:** Path traversal in `scripts/ingest-clubs.js` allowed reading/writing arbitrary files outside the repository.
**Learning:** `path.join` on user-supplied paths without validation creates path traversal risks, even in local CLI scripts. Naive `.startsWith(resolvedRoot)` validation is insecure; it must check `.startsWith(resolvedRoot + path.sep)` to avoid bypassing validation via sibling directory names.
**Prevention:** Always use `path.resolve` for user-supplied paths and validate them against an absolute root directory using `path.sep` suffix.
