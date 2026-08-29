## 2024-10-24 - Data Exposure in Error Handling
**Vulnerability:** Raw HTTP response bodies and LLM responses were being logged unconditionally or exposed in thrown Error objects in `scripts/lib/llm-extract.js`.
**Learning:** Exposing raw responses from external APIs in errors or logs can leak sensitive data (e.g., tokens, internal server errors, or sensitive model outputs).
**Prevention:** Sanitize error messages and avoid unconditionally logging raw data from external sources.
