## 2024-07-18 - Prevent Path Traversal in File Resolution
**Vulnerability:** Node.js script `ingest-clubs.js` allowed directory traversal by resolving arbitrary command line file paths via `path.join(__dirname, userPath)`.
**Learning:** Using `path.join` with untrusted input can easily bypass intended directory limits, letting users access/write out of bounds. The CLI inputs act as untrusted inputs here.
**Prevention:** A reusable security pattern in this project's Node.js scripts to prevent Path Traversal is to use `path.resolve(ROOT, userPath)` and strictly verify that the resolved path starts with the intended root directory appended with `path.sep`: `resolved.startsWith(path.resolve(ROOT) + path.sep)`.
