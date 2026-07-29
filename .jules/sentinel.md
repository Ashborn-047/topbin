## 2024-07-29 - [CRITICAL] Prevent Path Traversal in Node.js Scripts
**Vulnerability:** Path Traversal vulnerability in `scripts/ingest-clubs.js` allowed users to read arbitrary files from the filesystem by using command-line arguments like `../../../../etc/passwd`.
**Learning:** `path.join()` allows for directory traversal sequences to resolve outside of the intended directory if not checked. This is highly risky when taking file paths via user input (e.g. `process.argv`).
**Prevention:** Use `path.resolve(ROOT, userPath)` and follow up with a strict verification that the resolved path starts with the intended root directory appended with `path.sep` (e.g. `resolvedPath.startsWith(ROOT + path.sep)`).
