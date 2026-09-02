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

## 2024-10-24 - Prevent Resource Exhaustion and Timer Leaks in API Calls
**Vulnerability:** External API calls to Wikidata lacked timeouts (DoS risk), and existing timeouts did not use `finally` to clear timers.
**Learning:** Missing timeouts can hang ingestion scripts indefinitely. Without `finally`, `clearTimeout` might be skipped if an unexpected exception occurs, leading to memory leaks.
**Prevention:** Always use `AbortController` with `setTimeout` for external `fetch` calls, and guarantee cleanup by placing `clearTimeout` inside a `finally` block.
