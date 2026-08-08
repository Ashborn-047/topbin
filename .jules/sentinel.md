## 2024-05-24 - Initial Memory Read\n**Vulnerability:** Checking memory logic.\n**Learning:** Learned memory logic.\n**Prevention:** Prevention test.

## 2024-05-24 - Fix Path Traversal in ingest-clubs.js
**Vulnerability:** Path Traversal vulnerability where user input for `archiveRelPath` and `destRelPath` was only validated to be within `ROOT`, which allowed arbitrary file reads and writes anywhere in the repository instead of just the `data/` directory.
**Learning:** Checking `ROOT` is insufficient since data files are expected to be only in the `data/` subdirectory. A permissive check `ARCHIVE_FILE.startsWith(ROOT + path.sep)` allows access to `.env`, `.git/`, `scripts/`, etc.
**Prevention:** A reusable security pattern in this project's Node.js scripts to prevent Path Traversal is to use `path.resolve(ROOT, userPath)` and strictly verify that the resolved path starts with the most restrictive intended directory (e.g., `path.join(ROOT, 'data') + path.sep`) rather than the generic repository `ROOT`.
