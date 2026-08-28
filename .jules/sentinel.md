## 2024-10-24 - Data Exposure in API Error Handling
**Vulnerability:** Raw HTTP response body was being thrown in an Error object when the NVIDIA API call failed, which could leak sensitive information into logs.
**Learning:** External API failures can include sensitive details (credentials, proxies, internal paths) in their raw error response bodies.
**Prevention:** Sanitize error messages and never blindly throw raw response bodies from external services in application errors.
