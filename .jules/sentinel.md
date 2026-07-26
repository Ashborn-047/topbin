## 2024-03-21 - Fix Path Traversal in Ingest Script
**Vulnerability:** The `scripts/ingest-clubs.js` script takes user input (`archiveRelPath` and `destRelPath`) from command line arguments and uses `path.join` with the `ROOT` directory. This allows for path traversal if an attacker provides inputs like `../../etc/passwd`.
**Learning:** `path.join` combined with user input is a common vector for path traversal.
**Prevention:** Use `path.resolve` and verify that the resolved path strictly starts with the intended base directory (e.g., `ROOT + path.sep`).
