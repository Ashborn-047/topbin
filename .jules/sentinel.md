## 2024-05-24 - Path Traversal in Ingestion Script
**Vulnerability:** User-supplied paths (`archiveRelPath` and `destRelPath`) in `scripts/ingest-clubs.js` were directly used in `path.join()` without validation, allowing path traversal outside the intended directory.
**Learning:** Node.js file system APIs like `fs.writeFileSync` require strict path validation when dealing with user inputs, even in internal administrative scripts.
**Prevention:** Use `path.resolve` and check if the resolved path starts with the intended root directory using `.startsWith(ROOT + path.sep)`.
