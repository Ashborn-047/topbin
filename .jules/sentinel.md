## 2024-08-27 - Data Exposure in Error Messages
**Vulnerability:** Raw HTTP response bodies from external APIs were being thrown in Error objects, which leaks sensitive information into standard application logs.
**Learning:** This existed because the error handling in `callLLM` tried to be helpful by including the full response text from the API error.
**Prevention:** Sanitize error messages and do not include raw HTTP response bodies from external APIs in Error objects or log them unconditionally.
