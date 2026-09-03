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
## 2024-05-24 - Prevent Timer Leaks in API Timeouts
**Vulnerability:** External API timeout handling used `clearTimeout` in success and `catch` paths separately, risking timer leaks.
**Learning:** Always use `finally` blocks for resource cleanup (like `clearTimeout`) when dealing with asynchronous `fetch` requests and `AbortController`.
**Prevention:** Enforce a strict pattern of placing `clearTimeout` inside `finally` blocks for any timeout-based fetch wrapper.
