## 2024-07-23 - Path Traversal Prevention
**Vulnerability:** Path traversal in `scripts/ingest-clubs.js` via command-line arguments. User-provided paths were joined directly with `ROOT` using `path.join()`.
**Learning:** `path.join` is vulnerable to `../` traversal or absolute path injection.
**Prevention:** Use `path.resolve(ROOT, userPath)` and strictly verify that the resolved path starts with the intended root directory appended with `path.sep`.
