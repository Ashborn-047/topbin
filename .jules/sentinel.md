## 2024-10-25 - Prevent Sensitive Data Exposure in API Errors
**Vulnerability:** Raw HTTP response body from the NVIDIA API was directly appended to the Error message and thrown, risking leakage of sensitive data into standard application logs.
**Learning:** External API errors can return detailed error objects that include context we don't want exposed. Unconditionally exposing raw response bodies violates the Fail Securely principle.
**Prevention:** Sanitize error messages by only exposing standard HTTP status codes/text and avoid throwing raw sensitive data in Error objects.