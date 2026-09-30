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
| Day 4 | Reliability, retries, timeouts, error handling | ⏭️ Next |
| Day 5 | Streaming and context management | ⬜ |
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
- `openai/gpt-oss-20b`
- Express API
- `GET /health`
- `POST /ask`
- Validation and error handling
- `app.ts` / `server.ts` / `ai.ts` separation
- Vitest
- Supertest
- Mocked API tests
- Real Groq integration tests
- Render deployment

Detailed notes: `docs/day-1.md`

---

# Day 2 — Prompt Engineering

Day 2 evolved the app into a support-ticket classifier.

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
- Prompt organization
- Evaluation-style datasets
- Parameterized integration tests
- Diagnosing prompt failures as specification failures

Detailed notes: `docs/day-2.md`

---

# Day 3 — Structured Outputs + Zod

Day 3 moved the classifier from a loose string contract to a schema-constrained, typed application response.

The core shift:

```text
prompt
  ↓
JSON Schema
  ↓
model
  ↓
structured JSON
  ↓
Zod validation
  ↓
typed TypeScript object
```

The main principle is:

> Use prompts to define meaning, JSON Schema to constrain model output, and Zod to validate what the application accepts.

Detailed notes: `docs/day-3.md`

---

## Structured Ticket Classification

The classifier now returns:

```json
{
  "category": "billing",
  "confidence": 0.94,
  "reason": "The customer reports a duplicate charge."
}
```

The application works with a typed object derived from Zod.

---

## Day 3 Testing

The full suite is green:

```text
Test Files  4 passed (4)
Tests      31 passed (31)
```

Coverage includes:

- Zod schema validation
- Express API tests
- Generic AI integration tests
- Clear classifier cases
- Boundary cases
- Messy user input
- Prompt-injection cases
- Ambiguous cases

The `Groq unavailable` message printed by `app.test.ts` is expected because that test intentionally verifies the `500` failure path.

---

## Day 3 Completion Checklist

```text
✅ Zod ticket schema exists
✅ TicketClassification type uses z.infer
✅ equivalent JSON Schema exists
✅ response_format uses json_schema
✅ strict mode enabled
✅ every schema field is required
✅ additionalProperties: false
✅ classifyTicket() returns TicketClassification
✅ raw model content is parsed
✅ parsed result is validated with Zod
✅ /tickets/classify returns structured JSON
✅ schema unit tests exist
✅ classifier integration tests use result.category
✅ confidence tested between 0 and 1
✅ reason tested as non-empty
✅ full test suite passes
```

---

## Git Workflow

Day 3 branch:

```text
day-3-structured-outputs
```

Recommended commit:

```bash
git add .
git commit -m "feat: complete structured ticket classification with Zod"
git push origin day-3-structured-outputs
```

After merge:

```bash
git tag day-3-complete
git push origin day-3-complete
```

---

## Next: Day 4

Day 4 focuses on reliability around external AI calls:

```text
timeouts
rate limits
retries
backoff
error classification
graceful degradation
logging
```

---

## Guiding Mental Model

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
