## 2024-07-31 - Fix Path Traversal in Node.js Scripts
**Vulnerability:** A reusable path traversal pattern was discovered in `scripts/ingest-clubs.js` where user-provided arguments were used in `path.join(ROOT, arg)` without any validation, allowing read/write operations outside the intended directory via `../` sequences or absolute paths.
**Learning:** In Node.js projects, relying on `path.join` for user input is unsafe because it does not normalize or restrict paths to the intended root directory, and subsequent file operations will execute outside the boundary.
**Prevention:** Establish a reusable pattern across all project scripts: strictly use `path.resolve(ROOT, arg)` and immediately verify the resolution is bounded by using `resolvedPath.startsWith(ROOT + path.sep)`.
