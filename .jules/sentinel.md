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

## 2026-09-13 - Prevent Resource Exhaustion (DoS) in External API Calls
**Vulnerability:** Unbounded `fetch` calls in `scripts/ingest-clubs.js` could cause the script to hang indefinitely if the Wikidata API is unresponsive.
**Learning:** Always enforce timeouts on external network requests to prevent resource exhaustion and hanging processes, especially in batch processing scripts.
**Prevention:** Use `AbortController` and `setTimeout` with `fetch`, ensuring `clearTimeout` is called in a `finally` block to prevent timer leaks.
