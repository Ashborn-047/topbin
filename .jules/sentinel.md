## Security and Formatting Learnings (Sentinel)

### Path Traversal in Ingestion Scripts
- **Vulnerability:** User-supplied file paths in `scripts/ingest-clubs.js` allowed directory traversal outside `data/`.
- **Mitigation:** Use `path.resolve(ROOT, userPath)` and strictly ensure that resolved file paths begin with `DATA_DIR + path.sep`.

### Sensitive Data Exposure in External API Errors
- **Vulnerability:** Uncaught or logged errors containing raw upstream HTTP response bodies can expose sensitive configuration or server tokens.
- **Mitigation:** Consume the response body without interpolating raw text into thrown Error messages (`throw new Error(\`API call failed: ${response.status} ${response.statusText}\`)`).

### Standardized Character Encoding & Utilities
- **Slugification:** Centralize string normalization and suffix removal inside `scripts/lib/utils.js`.
- **Character Encoding:** Normalize Unicode dashes (`−`) to ASCII hyphens (`-`) across raw data text files.
## 2024-05-24 - Timer and memory leak in fetch timeout handling
**Vulnerability:** Timeout timers used for external API fetch calls were not properly cleared inside a finally block, leaving active timers alive and leading to memory leaks.
**Learning:** The previous code attempted to `clearTimeout` manually in `try` and `catch` but it is not robust or reliable. Placing `clearTimeout` in `finally` guarantees execution regardless of success or failure.
**Prevention:** Always use a `finally` block to execute cleanup code, such as `clearTimeout`, when handling resource constraints or abort controllers.
