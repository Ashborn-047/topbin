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

## 2024-09-06 - Enforce Timeouts on External API Calls
**Vulnerability:** Missing timeouts on `fetch` calls to Wikidata and early timer clearing for LLM API calls could cause ingestion scripts to hang indefinitely, leading to resource exhaustion (DoS).
**Learning:** When fetching from external APIs, it's crucial to enforce timeouts. Additionally, `clearTimeout` must be placed in a `finally` block to prevent timer/memory leaks and ensure that body parsing (`.json()`, `.text()`) is fully covered by the timeout window.
**Prevention:** Always use `AbortController` with `setTimeout` and place `clearTimeout` inside a `finally` block for robust timeout protection on all external HTTP requests.
