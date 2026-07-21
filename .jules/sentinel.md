## 2023-10-27 - [Path Traversal in CLI Scripts]
**Vulnerability:** Path traversal in `scripts/ingest-clubs.js` via unvalidated command-line arguments.
**Learning:** Command-line scripts that write to or read from the filesystem using relative paths are susceptible to path traversal attacks if inputs are not sanitized.
**Prevention:** Always use `path.resolve` and verify that the resolved path starts with the intended root directory appended with `path.sep`.
