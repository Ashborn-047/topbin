## 2024-05-24 - [Fix Path Traversal in ingestion script]
**Vulnerability:** A script (`scripts/ingest-clubs.js`) took command line arguments that were directly concatenated into file paths using `path.join()`, allowing path traversal (e.g., reading/writing files outside the intended directories like `../../../etc/passwd`).
**Learning:** This existed because command-line inputs were implicitly trusted and standard path operations (`path.join`) don't prevent directory climbing via `..`. The script processes local data ingestion, making it a viable target for local path traversal.
**Prevention:** Always use `path.resolve(ROOT, userInput)` and explicitly verify that the resolved path starts with the intended root directory (e.g., `if (!resolvedPath.startsWith(ROOT + path.sep))`).
