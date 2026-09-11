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

## 2024-06-15 - Timer Leaks and Logged Raw Responses
**Vulnerability:** External API fetch had memory/timer leaks due to `clearTimeout` not being in a `finally` block, and error logs exposed raw sensitive HTTP response data (`cleaned`).
**Learning:** Hardcoding `clearTimeout` in both `try` and `catch` blocks can still miss edge cases. Unconditionally logging raw response data bypasses normal error handling boundaries.
**Prevention:** Always place `clearTimeout` in a `finally` block for `fetch` timeout wrappers. Always sanitize error logs to remove raw sensitive payload data.
