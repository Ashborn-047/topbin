## 2024-10-24 - Data Exposure via Error Objects
**Vulnerability:** Raw HTTP response bodies from external APIs were included in thrown Error objects in `scripts/lib/llm-extract.js`.
**Learning:** Throwing raw external HTTP responses in Error objects leads to sensitive data leaking into standard application logs when caught and logged unconditionally (e.g. `console.error`).
**Prevention:** Mitigate data exposure by sanitizing error messages. Never throw raw sensitive data or full HTTP response bodies from external APIs in Error objects.
