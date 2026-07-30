## 2024-07-30 - Prevent Path Traversal in Node Scripts
**Vulnerability:** Command-line argument paths (archiveRelPath, destRelPath) in `scripts/ingest-clubs.js` were passed directly to `path.join(__dirname, '..', ...)` without validation, allowing Path Traversal using `../` to access files outside the project root.
**Learning:** `path.join` does not normalize paths or enforce boundaries. `path.resolve` combined with a boundary check is required to secure path inputs.
**Prevention:** Always use `path.resolve(ROOT, userPath)` and verify that the resolved path starts with `ROOT + path.sep` before operating on files with user-provided path segments.
