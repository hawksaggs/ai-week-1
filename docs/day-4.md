# Day 4 — Reliability for AI API Calls

Day 4 is about making the backend safer when the AI provider is slow, unavailable, rate limited, or temporarily failing.

The main idea is simple:

> The AI provider is an external dependency, so our backend should expect it to fail sometimes.

This is the same kind of reliability problem a backend engineer already handles with payment gateways, databases, Redis, third-party APIs, and microservices.

---

## Status

```text
✅ Complete
```

Final test result:

```text
Test Files  4 passed (4)
Tests      34 passed (34)
```

---

## Day 4 Goal

Handle situations like:

```text
Our API
   ↓
Groq
   │
   ├── responds normally ✅
   ├── responds too slowly ⏱️
   ├── rate limits us 🚦
   ├── temporarily fails 💥
   └── rejects a bad request ❌
```

Main concepts:

```text
timeout
retry
backoff
rate limiting
error classification
HTTP error mapping
logging
```

---

## 1. Why Reliability Matters

Groq is an external service, so we do not fully control network speed, provider availability, rate limits, response time, or temporary server failures.

The backend should assume:

```text
external calls can fail
```

This is normal backend engineering.

---

## 2. Timeout

A timeout means:

> Stop waiting after a certain amount of time.

The Groq client uses:

```ts
timeout: 10_000
```

That is 10 seconds per request attempt.

Mental model:

```text
fast response
→ success

too slow
→ timeout
```

The main lesson:

> A timeout prevents the backend from waiting forever.

---

## 3. Retry

A retry means:

> If a temporary failure happens, try again.

Configuration:

```ts
maxRetries: 2
```

This means:

```text
original attempt
+
retry 1
+
retry 2
```

So there can be up to 3 attempts total.

---

## 4. Timeout vs Retry

```text
timeout
→ how long one attempt can wait

retry
→ whether another attempt should happen
```

Example:

```text
attempt 1
→ timeout

retry 1
→ succeeds
```

---

## 5. Backoff

Backoff means:

> Wait before retrying.

Bad:

```text
retry
retry
retry
retry
```

Better:

```text
attempt
   ↓ fail

wait
   ↓

retry
```

The SDK handles retry backoff for supported temporary failures.

---

## 6. Rate Limiting

A common rate-limit response is:

```text
429 Too Many Requests
```

Simple meaning:

> The provider is temporarily receiving too many requests from us.

Correct mental model:

```text
wait
↓
retry later
```

---

## 7. Not Every Error Should Retry

Temporary failures may improve on another attempt.

Programming or configuration problems usually will not.

```text
network failure
timeout
429
5xx
→ retry may help
```

while:

```text
400
401
403
→ repeating the same request usually will not help
```

Remember:

> Retry temporary failures, not permanent mistakes.

---

## 8. Groq Client Reliability Configuration

```ts
return new Groq({
  apiKey,
  timeout: 10_000,
  maxRetries: 2,
});
```

This gives the app a basic reliability policy without requiring a custom retry system.

---

## 9. Error Classification

Provider-specific errors are translated into application-specific errors.

```text
Groq-specific error
        ↓
translator
        ↓
application-specific error
```

Current application-level AI errors include:

```text
AI_TIMEOUT
AI_RATE_LIMIT
AI_UNAVAILABLE
AI_UNKNOWN
```

Conceptually:

```text
Groq timeout
      ↓
AI_TIMEOUT

Groq rate limit
      ↓
AI_RATE_LIMIT

Groq server/network problem
      ↓
AI_UNAVAILABLE
```

---

## 10. Why Error Translation Helps

Without translation:

```text
Express
→ must understand Groq classes
```

With translation:

```text
Groq
   ↓
AI layer
   ↓
AIError
   ↓
Express
```

The rest of the application only understands its own error language.

This also makes switching providers easier later.

---

## 11. HTTP Error Mapping

The central Express error middleware translates application errors into HTTP responses.

```text
AI_TIMEOUT
→ 504 Gateway Timeout

AI_RATE_LIMIT
→ 503 Service Unavailable

AI_UNAVAILABLE
→ 503 Service Unavailable

unknown failure
→ 500
```

The important lesson is:

> Provider errors should become a stable API contract for clients.

---

## 12. Reliability Tests

Day 4 API tests include:

```text
✅ timeout → 504
✅ rate limited → 503
✅ provider unavailable → 503
```

These are mocked tests:

```text
mock classifyTicket()
        ↓
throw AIError
        ↓
Express middleware
        ↓
assert HTTP response
```

This is deterministic backend testing.

---

## 13. Final Test Result

The full suite is green:

```text
Test Files  4 passed (4)
Tests      34 passed (34)
```

This includes all previous Day 1–3 behavior plus the new reliability tests.

The stderr stack traces are expected because the tests deliberately create failures and the middleware logs them.

---

## 14. Request Duration Logging

Day 4 adds timing information around AI calls.

```text
record start time
      ↓
call Groq
      ↓
record end time
      ↓
calculate duration
```

Example:

```ts
const startTime = Date.now();

const response =
  await groq.chat.completions.create(...);

const durationMs =
  Date.now() - startTime;
```

---

## 15. Structured Logging

Final log format:

```ts
console.log("AI request succeeded", {
  operation: "classify_ticket",
  provider: "groq",
  durationMs,
});
```

The naming is intentional:

```text
classify_ticket
→ clearly identifies the operation

durationMs
→ clearly identifies the unit
```

Structured fields are easier to search, filter, and later move into a real logging system.

---

## 16. Useful vs Unsafe Log Data

Useful:

```text
operation
provider
durationMs
success/failure
error code
status
```

Avoid:

```text
API keys
authorization headers
passwords
secrets
sensitive customer content
```

Simple rule:

> Log enough to debug, but do not log secrets.

---

## 17. What Real Timing Logs Showed

The real classifier tests showed that model latency varies.

Some requests complete in a few hundred milliseconds, while ambiguous cases can take several seconds.

Timing logs help answer:

```text
Was the model slow?
Was one request type slower?
Did latency increase?
Did a request fail after waiting?
```

This is the beginning of observability.

---

## 18. Day 4 Architecture

```text
HTTP request
      ↓
Express
      ↓
AI service
      ↓
Groq
      │
      ├── success
      │     ↓
      │  duration log
      │
      └── failure
            ↓
      translateGroqError()
            ↓
          AIError
            ↓
      Express middleware
            ↓
      stable HTTP response
```

---

## 19. Learning Checklist

```text
✅ why external AI calls need reliability handling
✅ what a timeout is
✅ what a retry is
✅ what maxRetries means
✅ timeout vs retry
✅ what backoff means
✅ why immediate retry loops are bad
✅ what rate limiting means
✅ why 429 can be retryable
✅ why not every error should retry
✅ temporary vs permanent-ish failures
✅ why provider errors should become application errors
✅ how Express maps AI errors to HTTP responses
✅ basic structured logging
✅ why request duration matters
✅ what should not be logged
```

---

## 20. Implementation Checklist

```text
✅ Groq timeout configured
✅ Groq maxRetries configured
✅ existing test suite still passes
✅ retryable failures understood
✅ non-retryable failures understood
✅ application-level AI errors added
✅ timeout handling added
✅ rate-limit handling added
✅ provider-unavailable handling added
✅ HTTP mapping added
✅ error-handling tests added
✅ request-duration logging added
✅ operation renamed to classify_ticket
✅ duration field renamed to durationMs
✅ full suite passes: 34/34
```

Day 4 is complete.

---

## 21. Knowledge Check

You should be able to explain:

1. Why external AI calls need a timeout.
2. What a retry is.
3. What `maxRetries: 2` means.
4. Timeout vs retry.
5. Why retries should wait.
6. What backoff means.
7. What HTTP 429 means.
8. Why temporary 5xx failures may be retried.
9. Why 401 usually should not be retried.
10. Why Groq-specific errors should be translated.
11. Why Express should expose a stable error contract.
12. Why duration logging is useful.
13. What information is safe to log.
14. What information should not be logged.

---

## 22. Git Checkpoint

Recommended branch:

```text
day-4-reliability
```

Commit:

```bash
git add .
git commit -m "feat: complete AI reliability and error handling"
git push origin day-4-reliability
```

After merge:

```bash
git tag day-4-complete
git push origin day-4-complete
```

---

## 23. Next: Day 5

Day 5 focuses on:

```text
streaming
conversation context
message history
context-window thinking
```

We will continue with the simpler learning style:

```text
problem first
↓
simple analogy
↓
small example
↓
implementation
```

---

# Day 4 Mental Model

```text
timeout
→ do not wait forever

retry
→ temporary failure may succeed next time

backoff
→ wait between retries

error classification
→ translate provider errors

HTTP mapping
→ stable API behavior

logging
→ understand production behavior
```

Day 4 is complete.
