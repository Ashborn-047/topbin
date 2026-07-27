## 2024-07-27 - [Fix Path Traversal in ingest-clubs.js]
**Vulnerability:** Path traversal vulnerability via user-provided arguments in scripts/ingest-clubs.js due to usage of `path.join(ROOT, userPath)` without bounding checks, allowing writing and reading of arbitrary files (e.g. `../../../../etc/passwd`).
**Learning:** `path.join` does not normalize paths to stay within a boundary. By passing strings like `../../`, one can escape the root directory entirely.
**Prevention:** The correct Node.js pattern for preventing path traversal is to use `const safePath = path.resolve(ROOT, userPath)` and then firmly verify `if (!safePath.startsWith(ROOT + path.sep)) { /* handle error */ }` to ensure the final path hasn't escaped the base directory.
