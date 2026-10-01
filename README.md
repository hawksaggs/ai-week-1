# AI Week 1 — Node.js AI Application Engineering

A seven-day hands-on project for learning how to build reliable AI-powered backend applications with Node.js and TypeScript.

This repository evolves throughout the week. The same application grows day by day, while `docs/day-X.md` captures concepts, implementation decisions, experiments, and lessons learned.

This project is part of my journey from **Node.js Backend Engineer → AI Application Engineer**.

---

## Week 1 Roadmap

| Day | Focus | Status |
| --- | --- | --- |
| Day 1 | LLM fundamentals, Groq, Express, testing, deployment | ✅ Complete |
| Day 2 | Prompt engineering and ticket classification | ✅ Complete |
| Day 3 | Structured Outputs + Zod | ✅ Complete |
| Day 4 | Reliability, retries, timeouts, error handling | ✅ Complete |
| Day 5 | Streaming and context management | ⏭️ Next |
| Day 6 | AI Support Ticket Analyzer | ⬜ |
| Day 7 | Evaluation and refactoring | ⬜ |

---

## Tech Stack

- Node.js
- TypeScript
- Express.js
- Groq SDK
- `openai/gpt-oss-20b`
- Zod
- Vitest
- Supertest
- dotenv

---

## Project Structure

```text
ai-week-1/
├── src/
│   ├── ai.ts
│   ├── app.ts
│   ├── server.ts
│   ├── errors/
│   │   └── ai.error.ts
│   ├── prompts/
│   │   └── classify-ticket.prompt.ts
│   └── schemas/
│       └── ticket.schema.ts
├── tests/
│   ├── fixtures/
│   │   └── ticket-cases.ts
│   ├── app.test.ts
│   ├── ai.integration.test.ts
│   ├── classify-ticket.integration.test.ts
│   ├── schema.test.ts
│   └── setup.ts
├── docs/
│   ├── day-1.md
│   ├── day-2.md
│   ├── day-3.md
│   ├── day-4.md
│   ├── day-5.md
│   ├── day-6.md
│   └── day-7.md
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

---

# Day 1 — LLM Application Fundamentals

Covered:

- LLM fundamentals
- Deterministic vs probabilistic behavior
- Models
- Prompts
- System vs user messages
- Tokens
- Context windows
- Reasoning effort
- Groq SDK integration
- Express API
- Vitest + Supertest
- Real Groq integration tests
- Render deployment

Detailed notes: `docs/day-1.md`

---

# Day 2 — Prompt Engineering

Covered:

- System instructions vs user input
- Ticket taxonomy
- Category boundaries
- Decision rules
- Business context
- Constraints
- Few-shot examples
- Ambiguous inputs
- Prompt injection
- Evaluation-style datasets
- Parameterized integration tests

Detailed notes: `docs/day-2.md`

---

# Day 3 — Structured Outputs + Zod

Day 3 moved the classifier from a loose string response to a schema-constrained, typed application contract.

Core mental model:

```text
Prompt
→ what the fields MEAN

JSON Schema
→ what the model MUST RETURN

Zod
→ what the application ACCEPTS

TypeScript
→ what the rest of the code can safely USE
```

Final Day 3 test result:

```text
Test Files  4 passed (4)
Tests      31 passed (31)
```

Detailed notes: `docs/day-3.md`

---

# Day 4 — Reliability

Day 4 focused on making the AI integration resilient when the provider is slow, rate limited, temporarily unavailable, or fails.

The main reliability flow is:

```text
Express
   ↓
AI service
   ↓
Groq
   │
   ├── success
   ├── timeout
   ├── rate limit
   ├── provider failure
   └── network failure
```

Detailed notes: `docs/day-4.md`

---

## Timeout and Retry Configuration

The Groq client uses an explicit timeout and retry policy:

```ts
return new Groq({
  apiKey,
  timeout: 10_000,
  maxRetries: 2,
});
```

Meaning:

```text
timeout
→ do not wait forever for one request attempt

maxRetries
→ retry temporary failures up to 2 extra times
```

---

## Backoff

Retries should not happen aggressively.

Conceptually:

```text
attempt
   ↓ fail

wait
   ↓

retry
```

The SDK handles retry backoff for supported temporary failures.

---

## Error Classification

Provider-specific errors are translated into application-specific errors.

```text
Groq timeout
      ↓
AI_TIMEOUT

Groq rate limit
      ↓
AI_RATE_LIMIT

Groq/provider failure
      ↓
AI_UNAVAILABLE
```

This keeps Groq-specific details inside the AI layer.

---

## HTTP Error Mapping

The Express error middleware turns AI errors into a stable API contract:

```text
AI_TIMEOUT
→ 504 Gateway Timeout

AI_RATE_LIMIT
→ 503 Service Unavailable

AI_UNAVAILABLE
→ 503 Service Unavailable
```

Clients do not need to know which AI provider is being used.

---

## Reliability Tests

New deterministic API tests verify:

```text
✅ AI timeout → 504
✅ AI rate limit → 503
✅ AI unavailable → 503
```

The final Day 4 test result is:

```text
Test Files  4 passed (4)
Tests      34 passed (34)
```

---

## Request Duration Logging

Classifier calls now record how long Groq requests take.

Final structured log format:

```ts
console.log("AI request succeeded", {
  operation: "classify_ticket",
  provider: "groq",
  durationMs,
});
```

Useful log fields include:

```text
operation
provider
durationMs
success/failure
application error code
```

Avoid logging secrets, API keys, authorization headers, passwords, or sensitive customer content.

---

## Day 4 Completion Checklist

```text
✅ Groq timeout configured
✅ Groq retries configured
✅ backoff concept understood
✅ retryable vs non-retryable failures understood
✅ application-level AI errors added
✅ timeout handling added
✅ rate-limit handling added
✅ provider-unavailable handling added
✅ HTTP error mapping added
✅ reliability tests added
✅ request-duration logging added
✅ operation log renamed to classify_ticket
✅ duration field renamed to durationMs
✅ full test suite passes: 34/34
```

Day 4 is complete.

---

## Day 4 Mental Model

```text
timeout
→ do not wait forever

retry
→ temporary failure may succeed next time

backoff
→ wait between retries

error classification
→ translate provider failures into app failures

HTTP mapping
→ give clients a stable contract

logging
→ understand what happened in production
```

---

## Git Workflow

Day 4 branch:

```text
day-4-reliability
```

Recommended commit:

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

## Next: Day 5

Day 5 will focus on:

```text
streaming
conversation context
message history
context-window thinking
```

The learning style will stay incremental: first understand the problem, then add one small implementation concept at a time.
