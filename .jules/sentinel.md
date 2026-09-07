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

## 2024-05-24 - Resource Exhaustion & Timer Leaks in API Calls
**Vulnerability:** External fetch calls lacked timeouts (DoS risk) and existing timeouts lacked finally blocks (timer/memory leak risk).
**Learning:** In Node.js, fetch has no default timeout. Clearing timers must happen in a finally block to ensure they execute regardless of promise resolution or errors.
**Prevention:** Always use AbortController with setTimeout for external API calls and ensure clearTimeout is in a finally block.
