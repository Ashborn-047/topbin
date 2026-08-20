## 2026-08-20 - Prevent Data Exposure in External API Error Handling
**Vulnerability:** Raw HTTP response bodies from the NVIDIA API and raw LLM JSON outputs were being thrown in Error objects and logged via console.error unconditionally.
**Learning:** External API responses and LLM outputs might contain sensitive data or internal system details. Unconditionally logging them leaks sensitive information into standard application logs.
**Prevention:** Always sanitize error messages. Consume raw response bodies to prevent resource leaks, but omit them from Error constructors. Mask raw outputs in console error logs.
