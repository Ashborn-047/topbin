
## 2024-07-23 - Path Traversal Vulnerability in `ingest-clubs.js`
**Vulnerability:** The script `scripts/ingest-clubs.js` takes input arguments `archiveRelPath` and `destRelPath` directly from user input (`process.argv`) and passes them to `path.join(ROOT, ...)` which is then read using `fs.readFileSync` and written using `fs.writeFileSync`. This creates a critical path traversal vulnerability allowing read/write access outside the intended directory.
**Learning:** `path.join` does not prevent directory traversal if the user supplies paths with `../`. It just normalizes the path.
**Prevention:** Always use `path.resolve` to get the absolute path, and verify that the resulting absolute path strictly starts with the intended root directory plus `path.sep` (e.g. `/app/`).
