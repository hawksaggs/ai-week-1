# AI Week 1 — Node.js AI Application Engineering

A seven-day hands-on project for learning how to build reliable AI-powered backend applications with Node.js and TypeScript.

This repository evolves throughout the week rather than creating a separate project for every day. Each day adds a new capability to the same application, while daily notes in `docs/` capture the concepts learned along the way.

The project starts with direct LLM integration using Groq and `openai/gpt-oss-20b`, then progresses through prompt engineering, structured outputs, reliability, streaming, evaluation, and a complete AI-powered support-ticket workflow.

This repository is part of my journey from **Node.js Backend Engineer → AI Application Engineer**.

---

## Week 1 Goals

By the end of Week 1, the project should demonstrate:

- Direct LLM integration from Node.js
- Prompt and context design
- Structured AI responses
- Runtime validation with Zod
- Express.js API design
- AI service separation
- Error handling and reliability
- Streaming responses
- Conversation/context management
- AI behavior testing
- API testing
- Real model integration testing
- Evaluation and regression testing
- Production-oriented AI backend architecture
- Deployment of an AI-powered API

---

## Week 1 Roadmap

```text
Day 1
LLM Fundamentals
+ Groq
+ Express
+ Testing
+ Deployment
        ↓
Day 2
Prompt Engineering
        ↓
Day 3
Structured Outputs + Zod
        ↓
Day 4
Reliability + Error Handling + Retries
        ↓
Day 5
Streaming + Context
        ↓
Day 6
AI Support Ticket Analyzer
        ↓
Day 7
Evaluation + Refactoring
```

### Day 1 — LLM Fundamentals

Topics:

- What an LLM is
- Deterministic vs probabilistic systems
- Models
- Prompts
- System vs user messages
- Tokens
- Context windows
- Reasoning effort
- Groq SDK integration
- `openai/gpt-oss-20b`
- Express.js API
- Vitest
- Supertest
- AI behavior tests
- Mocked API tests
- Real Groq integration tests
- Deployment

Detailed notes: `docs/day-1.md`

### Day 2 — Prompt Engineering

Topics:

- System instructions
- User input
- Context
- Constraints
- Decision rules
- Few-shot examples
- Prompt structure
- Prompt injection basics
- Prompt versioning

### Day 3 — Structured Outputs

Topics:

- Free-form text vs typed responses
- JSON Schema
- Structured Outputs
- Zod
- Runtime validation
- Type-safe AI responses

### Day 4 — Reliability

Topics:

- External API failures
- Rate limits
- Timeouts
- Retries
- Backoff
- Error classification
- Graceful failure
- Logging

### Day 5 — Streaming and Context

Topics:

- Streaming responses
- Server-sent events
- Conversation state
- Context construction
- Token limits
- Context management

### Day 6 — AI Support Ticket Analyzer

Build a complete application that combines the concepts learned during the week.

Expected capabilities:

- Ticket classification
- Priority detection
- Summary generation
- Human-escalation decision
- Suggested action
- Structured responses
- Validation
- API endpoints
- Error handling
- Tests

### Day 7 — Evaluation and Refactoring

Topics:

- AI evaluation datasets
- Behavioral assertions
- Regression testing
- Prompt comparison
- Architecture cleanup
- Production readiness review

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

Additional tools may be introduced during the week only when the problem being solved requires them.

---

## Project Structure

The same application evolves throughout the entire week.

```text
ai-week-1/
├── src/
│   ├── ai.ts
│   ├── app.ts
│   ├── server.ts
│   ├── prompts/
│   │   └── ...
│   └── schemas/
│       └── ...
├── tests/
│   ├── app.test.ts
│   ├── ai.integration.test.ts
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

The source code is not duplicated into separate day folders. Git history shows how the application evolved, while `docs/day-X.md` shows what was learned each day.

---

## Architecture

```text
Client
  │
  ▼
Express API
  │
  ▼
Input validation
  │
  ▼
AI service
  │
  ▼
Groq SDK
  │
  ▼
openai/gpt-oss-20b
  │
  ▼
Generated response
  │
  ▼
Express API
  │
  ▼
Client
```

As the week progresses, this architecture will gain structured output, validation, reliability, streaming, and evaluation capabilities.

---

## Responsibilities

### `server.ts`

Starts the HTTP server.

### `app.ts`

Handles Express setup, middleware, routes, request validation, status codes, and error handling.

### `ai.ts`

Handles the Groq client, model configuration, messages, reasoning settings, and model response parsing.

---

## Prerequisites

- Node.js 18+
- npm
- A Groq API key

---

## Installation

```bash
git clone https://github.com/hawksaggs/ai-week-1.git
cd ai-week-1
npm install
```

---

## Environment Variables

Create a `.env` file:

```env
GROQ_API_KEY=your_groq_api_key
```

Keep a safe template in `.env.example`:

```env
GROQ_API_KEY=
```

Never commit `.env` or real API keys.

---

## Running the Application

```bash
npm run dev
```

Local API:

```text
http://localhost:3000
```

---

## API Endpoints

### Health Check

```http
GET /health
```

```bash
curl http://localhost:3000/health
```

Response:

```json
{
  "status": "ok"
}
```

### Ask the AI

```http
POST /ask
```

Request:

```json
{
  "question": "Explain the Node.js event loop in 100 words"
}
```

```bash
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Explain the Node.js event loop in 100 words"
  }'
```

Example response:

```json
{
  "answer": "Node.js uses an event-driven architecture...",
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 100,
    "total_tokens": 120
  }
}
```

---

## Current AI Model

The project currently uses:

```text
openai/gpt-oss-20b
```

through the Groq SDK.

---

## Testing

The project uses Vitest and Supertest.

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Verbose output:

```bash
npx vitest run --reporter=verbose
```

### Express API Tests

`tests/app.test.ts` should mock the AI service and test routes, status codes, validation, response formatting, error handling, and whether `ask()` is called correctly.

These tests should stay fast and deterministic.

### AI Integration Tests

`tests/ai.integration.test.ts` calls Groq for real and verifies model connectivity, non-empty responses, approximate prompt requirements, required concepts, and token usage.

These tests are naturally slower, network-dependent, variable, and quota-consuming.

---

## AI Testing Mindset

Traditional backend testing:

```text
input
  ↓
deterministic function
  ↓
exact output
```

AI evaluation:

```text
prompt
  ↓
model
  ↓
variable output
  ↓
does it satisfy the requirement?
```

Prefer behavioral checks over exact-string comparisons.

---

## Key Engineering Principle

> Use the model for intelligence. Use deterministic backend code for guarantees.

The model can help with language understanding, classification, summarization, generation, and reasoning.

Node.js should continue to own authentication, authorization, validation, business rules, database operations, security, permissions, financial checks, HTTP behavior, and application state.

The LLM is a component of the backend, not the backend itself.

---

## Deployment

The application is deployed on Render:

```text
https://ai-week-1.onrender.com
```

Health check:

```bash
curl https://ai-week-1.onrender.com/health
```

AI request:

```bash
curl -X POST https://ai-week-1.onrender.com/ask \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Explain Node.js in one sentence"
  }'
```

The server should listen on the environment-provided port and bind to `0.0.0.0`.

---

## Git Checkpoints

Use Git tags to preserve the exact state after each day.

```bash
git tag day-1-complete
git push origin day-1-complete
```

Later:

```bash
git tag day-2-complete
git push origin day-2-complete
```

---

## Daily Notes

```text
docs/
├── day-1.md
├── day-2.md
├── day-3.md
├── day-4.md
├── day-5.md
├── day-6.md
└── day-7.md
```

Each document can capture concepts learned, architecture decisions, code patterns, testing lessons, problems encountered, and a completion checklist.

---

## Day 1 Status

```text
✅ LLM fundamentals
✅ Deterministic vs probabilistic behavior
✅ Models
✅ Prompts
✅ System vs user messages
✅ Tokens
✅ Context windows
✅ Reasoning effort
✅ Groq SDK
✅ openai/gpt-oss-20b
✅ Environment variables
✅ Express API
✅ GET /health
✅ POST /ask
✅ Input validation
✅ Error handling
✅ app.ts / server.ts separation
✅ Vitest
✅ Supertest
✅ API tests
✅ Mocked AI layer
✅ Real Groq integration tests
✅ GitHub repository
✅ Render deployment
```

---

## Concepts Intentionally Deferred

```text
LangChain
LangGraph
Agents
MCP
RAG
Embeddings
Vector databases
Fine-tuning
Multi-agent systems
```

The goal is to understand the primitives before introducing frameworks.

---

## End-of-Week Target

```text
HTTP API
   ↓
validated input
   ↓
well-designed prompts
   ↓
structured AI output
   ↓
runtime validation
   ↓
reliability controls
   ↓
streaming/context management
   ↓
AI evaluation
   ↓
tested application
   ↓
deployed service
```

---

## Guiding Principle

AI application engineering is not simply calling an LLM API.

The goal is to surround a probabilistic model with enough deterministic engineering that the overall application behaves reliably.

```text
input
  ↓
model
  ↓
probabilistic output
  ↓
validation
  ↓
business logic
  ↓
testing / evaluation
  ↓
reliable application behavior
```

That is the focus of this Week 1 project.
