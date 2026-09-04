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

## 2024-05-30 - Resource Exhaustion via Timer Leaks
**Vulnerability:** External API calls enforcing timeouts lacked a `finally` block to clear the timer, leading to potential memory and timer leaks.
**Learning:** To prevent Denial of Service (DoS) through resource exhaustion in Node.js, cleanup functions like `clearTimeout` must run regardless of success or failure.
**Prevention:** Always place `clearTimeout` inside a `finally` block when wrapping promises with `setTimeout`.
