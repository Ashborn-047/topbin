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

## 2024-05-24 - Resource Exhaustion (DoS) via Missing API Timeouts
**Vulnerability:** External `fetch` calls to Wikidata API in `scripts/ingest-clubs.js` lacked timeouts, exposing the ingestion process to indefinite hangs and resource exhaustion if the API is unresponsive. Additionally, timeout implementations in `scripts/lib/llm-extract.js` were prone to timer leaks because `clearTimeout` was not placed in a `finally` block.
**Learning:** Using `AbortController` is necessary for `fetch` timeouts in Node, but careful resource management (cleaning up the timeout handle) must be centralized in `finally` to prevent memory leaks in both success and error paths.
**Prevention:** Always enforce strict timeouts on external HTTP requests and ensure `clearTimeout` is definitively executed within a `finally` block.
