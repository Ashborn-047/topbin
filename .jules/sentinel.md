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

## 2026-09-12 - Resource Exhaustion and Timer Leaks in External API Calls
**Vulnerability:** External `fetch` calls lacked timeouts (risking DoS via resource exhaustion), and existing timeouts did not use a `finally` block for `clearTimeout` (risking timer/memory leaks).
**Learning:** In Node.js environments, hanging API calls can exhaust resources. Placing `clearTimeout` strictly inside `finally` blocks guarantees timer cleanup regardless of success or error paths.
**Prevention:** Always wrap `fetch` calls in `try/finally` when using `setTimeout` with `AbortController`, ensuring `clearTimeout` is in the `finally` block.
