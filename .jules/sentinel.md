## 2024-05-23 - Prevent Resource Exhaustion on External APIs
**Vulnerability:** External `fetch` calls to Wikidata lacked timeout enforcement, risking resource exhaustion or script hangs if the external service becomes unresponsive.
**Learning:** Node.js `fetch` does not have a default timeout. Unbounded external API calls in loops can consume resources and cause silent failures.
**Prevention:** Always use `AbortController` in conjunction with `setTimeout` for external `fetch` calls.

## 2024-05-23 - Prevent Resource Exhaustion on External APIs
**Vulnerability:** External `fetch` calls to Wikidata lacked timeout enforcement, risking resource exhaustion or script hangs if the external service becomes unresponsive.
**Learning:** Node.js `fetch` does not have a default timeout. Unbounded external API calls in loops can consume resources and cause silent failures.
**Prevention:** Always use `AbortController` in conjunction with `setTimeout` for external `fetch` calls.
