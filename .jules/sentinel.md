## 2025-02-14 - Prevent Data Exposure in API Errors
**Vulnerability:** Upstream API diagnostic text was exposed in a thrown Error in `llm-extract.js`.
**Learning:** Returning detailed API responses unconditionally within Errors can expose sensitive internal API diagnostic details or tokens into downstream logs. Also, logging the raw sensitive data directly to `console.error` locally when removing it from the thrown Error just shifts the data leak to standard application logs rather than fully fixing the vulnerability.
**Prevention:** Avoid injecting full, raw API response bodies (`response.text()`) into generic Error constructors. Only include safe metadata like the status code and status text. Do not leak the sensitive data to generic log outputs either.
