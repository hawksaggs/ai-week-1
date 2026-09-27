# AI Week 1 — Node.js AI Application Fundamentals

A hands-on Node.js and TypeScript project for learning how to build AI-powered backend applications with Express.js, Groq, and `openai/gpt-oss-20b`.

The project focuses on understanding how an LLM fits into a real backend application: model calls, prompts, token usage, HTTP APIs, validation, testing, error handling, and deployment.

This is part of a broader learning journey from **Node.js Backend Engineer → AI Application Engineer**.

---

## Goals

The goal of Week 1 is to build a strong foundation before introducing higher-level AI frameworks.

By completing this project, you should understand:

- How a Node.js application calls an LLM
- What models, prompts, tokens, and context windows are
- The difference between deterministic backend logic and probabilistic AI output
- How to expose an LLM through an Express API
- How to inspect token usage
- How to test AI behavior
- How to test Express endpoints
- How to separate API tests from real AI integration tests
- How to handle environment variables and API keys safely
- How to prepare an AI backend for deployment

---

## Tech Stack

- Node.js
- TypeScript
- Express.js
- Groq SDK
- `openai/gpt-oss-20b`
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
│   └── server.ts
│
├── tests/
│   ├── app.test.ts
│   ├── ai.test.ts
│   └── setup.ts
│
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### Responsibilities

```text
server.ts
└── starts the HTTP server

app.ts
├── Express configuration
├── middleware
├── routes
├── validation
└── error handling

ai.ts
├── Groq client
├── model configuration
├── prompts/messages
├── reasoning settings
└── model response handling
```

---

## Prerequisites

Make sure you have:

- Node.js 18+
- npm
- A Groq API key

---

## Installation

Clone the repository:

```bash
git clone <your-repository-url>
cd ai-week-1
```

Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key
```

Do not commit your `.env` file.

Your `.gitignore` should contain:

```text
node_modules
.env
```

---

## AI Service

The project uses Groq with:

```text
openai/gpt-oss-20b
```

Example AI service:

```ts
import Groq from "groq-sdk";

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY environment variable is required",
    );
  }

  return new Groq({
    apiKey,
  });
}

export async function ask(input: string) {
  const groq = getGroqClient();

  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",

    messages: [
      {
        role: "user",
        content: input,
      },
    ],

    reasoning_effort: "low",
  });

  return {
    content: response.choices[0]?.message?.content ?? "",
    usage: response.usage,
  };
}
```

---

## Running the Application

Start the development server:

```bash
npm run dev
```

The server runs locally at:

```text
http://localhost:3000
```

---

## API Endpoints

### Health Check

```http
GET /health
```

Example:

```bash
curl http://localhost:3000/health
```

Response:

```json
{
  "status": "ok"
}
```

---

### Ask the AI

```http
POST /ask
```

Request body:

```json
{
  "question": "Explain the Node.js event loop in 100 words"
}
```

Example:

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

## Request Flow

```text
Client
  │
  │ POST /ask
  ▼
Express
  │
  ▼
Input validation
  │
  ▼
ask()
  │
  ▼
Groq API
  │
  ▼
openai/gpt-oss-20b
  │
  ▼
Generated response
  │
  ▼
Express
  │
  ▼
JSON response
```

---

## Testing

The project uses:

- Vitest as the test runner
- Supertest for Express endpoint testing

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

For verbose test output:

```bash
npx vitest run --reporter=verbose
```

---

## API Tests vs AI Tests

A useful distinction in AI applications is separating deterministic API tests from real model integration tests.

### Express API tests

These should ideally be:

- Fast
- Deterministic
- Independent of Groq availability
- Independent of API quota

Typical cases:

```text
GET /health
POST /ask with missing question
POST /ask with empty question
POST /ask with invalid input
```

These tests should eventually mock the `ask()` service.

### AI integration tests

These call Groq for real.

They verify things such as:

- The model returns non-empty text
- Prompt constraints are followed approximately
- Required concepts appear in the response
- Token usage is returned

Because LLM outputs can vary, avoid testing exact text.

Avoid:

```ts
expect(result.content).toBe(
  "Node.js is a JavaScript runtime..."
);
```

Prefer behavioral assertions:

```ts
expect(result.content.length).toBeGreaterThan(0);
```

or:

```ts
expect(result.content.toLowerCase()).toContain("i/o");
```

---

## AI Testing Mindset

Traditional backend testing often looks like:

```text
input
  ↓
deterministic function
  ↓
exact expected output
```

LLM testing is different:

```text
prompt
  ↓
model
  ↓
variable output
  ↓
does the result satisfy the requirement?
```

This is the beginning of AI evaluation, which will become more important later in the learning roadmap.

---

## Key Concepts Learned

### LLM

A Large Language Model processes context and generates output based on learned patterns.

### Tokens

Models process text as tokens rather than simple words.

Tokens affect:

```text
context limits
latency
cost
```

### Context Window

The context window represents the amount of information available to the model during a request.

It can include:

```text
system instructions
user input
conversation history
retrieved documents
tool results
generated content
```

### Probabilistic Output

Traditional backend logic is usually deterministic:

```text
input
  ↓
code
  ↓
predictable result
```

LLMs are generative:

```text
input
  ↓
model
  ↓
potentially variable result
```

### Application Responsibility

A core principle for this project:

> Use the model for intelligence and natural-language reasoning. Use deterministic backend code for guarantees.

Critical operations such as authorization, validation, financial checks, permissions, and business rules should remain inside application code.

---

## Example Prompt Experiments

Try sending variations of the same request:

```text
Explain Node.js.
```

```text
Explain Node.js to a frontend React developer
who has never built a backend.
```

```text
Explain Node.js in exactly three bullet points.
```

```text
Explain the Node.js event loop
to an experienced backend engineer.

Focus on I/O performance.
```

Observe how audience, constraints, context, and formatting instructions change model behavior.

---

## npm Scripts

Example `package.json` scripts:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "start": "tsx src/server.ts",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

---

## Deployment

The project can be deployed as a Node.js web service on Render.

The server should listen on the environment-provided port:

```ts
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
```

For deployment:

1. Push the project to GitHub.
2. Create a new Web Service on Render.
3. Connect the GitHub repository.
4. Configure the build/start commands.
5. Add `GROQ_API_KEY` as an environment variable.
6. Deploy the service.
7. Verify `/health`.
8. Test `/ask` against the deployed URL.

Never commit the Groq API key to GitHub.

---

## Day 1 Completion Checklist

```text
✅ Groq SDK integration
✅ openai/gpt-oss-20b model
✅ Environment variable configuration
✅ Basic model calls
✅ Prompt experiments
✅ Token usage inspection
✅ Express.js API
✅ GET /health
✅ POST /ask
✅ Request validation
✅ Error handling
✅ Vitest
✅ Supertest
✅ Express API tests
✅ AI behavior tests

⬜ Mock AI calls in normal API tests
⬜ Keep separate real Groq integration tests
⬜ Deploy to Render
```

---

## Roadmap

After completing Day 1, the next topics are:

```text
Day 2
Prompt Engineering
      ↓
Day 3
Structured Outputs + Zod
      ↓
Tool Calling
      ↓
Embeddings
      ↓
RAG
      ↓
Agents
      ↓
MCP
      ↓
Evals + Observability
      ↓
Production AI Applications
```

---

## Guiding Principle

The purpose of this repository is not simply to learn how to call an LLM API.

The goal is to learn how to build reliable software around a probabilistic model:

```text
input
  ↓
LLM
  ↓
uncertain output
  ↓
validation
  ↓
business logic
  ↓
testing / evaluation
  ↓
reliable application behavior
```

AI application engineering is the practice of combining model intelligence with strong backend engineering.
