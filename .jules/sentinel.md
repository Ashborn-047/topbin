## 2026-07-20 - Path Traversal Vulnerability in ingestion script
**Vulnerability:** Path traversal in `scripts/ingest-clubs.js` where user-provided arguments `archiveRelPath` and `destRelPath` are concatenated directly into a file path using `path.join(ROOT, ...)`, allowing file read/write outside the project directory.
**Learning:** The script naively assumes command line arguments `archiveRelativePath` and `destRelativePath` are safe. `path.join` does not prevent directory traversal if the input contains `../`.
**Prevention:** Use `path.resolve` and verify that the resulting path strictly starts with the intended root directory appended with `path.sep` (e.g. `path.resolve(ROOT, userPath).startsWith(path.resolve(ROOT) + path.sep)`).
