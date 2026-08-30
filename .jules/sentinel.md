## 2024-05-24 - Prevent Sensitive Data Leakage in API Error Messages
**Vulnerability:** The LLM extraction script threw raw HTTP response bodies in its Error objects when the NVIDIA API call failed.
**Learning:** Unconditionally appending external API response text to Error objects can leak sensitive internal information (e.g., internal paths, token data, or infrastructure details) into standard application logs when the error is caught and printed.
**Prevention:** Always sanitize error messages. Consume API response bodies if necessary for resource cleanup, but do not expose raw response data in thrown exceptions or local error logs.
