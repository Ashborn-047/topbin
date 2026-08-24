## 2024-08-24 - Prevent Data Exposure in API Errors and Logs
**Vulnerability:** The LLM extraction script logged raw API response bodies in error messages and raw LLM output on JSON parse failures.
**Learning:** Exposing raw third-party responses or AI-generated output in logs can unintentionally leak sensitive backend details, API formats, or prompt injection artifacts.
**Prevention:** Always sanitize error messages to exclude raw HTTP bodies or unvalidated output strings. Log only actionable HTTP status codes or generic parse error indicators.
