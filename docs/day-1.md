# Day 1 — AI Application Fundamentals with Node.js, Express, Groq, and GPT-OSS

This document summarizes the concepts, code, testing practices, and architecture covered during Day 1 of the journey from **Node.js Backend Engineer → AI Application Engineer**.

The objective of Day 1 is not to learn agents, RAG, embeddings, vector databases, or AI frameworks. The goal is to understand the basic interaction between a Node.js backend and a Large Language Model (LLM), then wrap that interaction in a testable HTTP API.

---

## Day 1 Goal

By the end of Day 1, you should understand this flow:

```text
Client
  │
  ▼
Express API
  │
  ▼
AI service
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
Express API
  │
  ▼
Client
```

You should also understand the difference between deterministic backend logic and probabilistic model behavior.

---

## Technology Used

```text
Node.js
TypeScript
Express.js
Groq SDK
openai/gpt-oss-20b
dotenv
Vitest
Supertest
```

---

# 1. What Is an LLM?

LLM stands for **Large Language Model**.

A traditional backend function executes logic written by a developer.

Example:

```ts
function calculateDiscount(amount: number) {
  if (amount > 10000) {
    return amount * 0.1;
  }

  return 0;
}
```

The flow is deterministic:

```text
input
  ↓
your code
  ↓
predictable output
```

An LLM behaves differently.

```text
input
  ↓
language model
  ↓
generated output
```

The model generates output based on the input and context it receives.

This means the same request may not always produce exactly the same wording.

The important mental model is:

> Traditional code executes rules. An LLM generates responses.

---

# 2. Deterministic vs Probabilistic Systems

Traditional application code is usually deterministic.

```text
f(x) → y
f(x) → y
f(x) → y
```

An AI model is probabilistic.

```text
prompt
  ↓
model
  ↓
possible valid response A

prompt
  ↓
model
  ↓
possible valid response B
```

Both responses may be acceptable.

This difference affects how AI applications must be tested.

Instead of always asking:

```text
Is actual output exactly equal to expected output?
```

AI applications often ask:

```text
Does the generated output satisfy the required behavior?
```

---

# 3. What Is a Model?

A model is the AI system your application calls.

For this project, we use:

```text
openai/gpt-oss-20b
```

through Groq.

The basic flow is:

```text
Node.js application
       │
       ▼
    Groq API
       │
       ▼
openai/gpt-oss-20b
       │
       ▼
generated response
```

Your application chooses which model should process the request.

Models can differ in:

- reasoning capability
- latency
- cost
- context capacity
- supported features

For Day 1, the goal is simply to understand how to call one model successfully.

---

# 4. What Is a Prompt?

A prompt is the input and instructions given to the model.

Example:

```text
Explain the Node.js event loop.
```

A more specific prompt might be:

```text
Explain the Node.js event loop
to an experienced backend engineer.

Focus on I/O performance.
Keep the explanation under 100 words.
```

The second prompt gives the model more information about:

```text
audience
scope
format
length
focus
```

A useful mental model is:

```text
model output
    =
model
+
instructions
+
input
+
context
```

This is not a literal mathematical formula. It is an engineering abstraction for thinking about model behavior.

---

# 5. System Message vs User Message

LLM chat APIs typically distinguish between application-controlled instructions and user input.

Example:

```ts
messages: [
  {
    role: "system",
    content: "You are a helpful Node.js teacher.",
  },
  {
    role: "user",
    content: "Explain the event loop.",
  },
]
```

Think of the difference like this:

```text
SYSTEM
  │
  └── How should the model behave?

USER
  │
  └── What does the user want?
```

Example:

```text
SYSTEM:
You classify customer support tickets.

USER:
I was charged twice.
```

The application controls the system behavior.

The user supplies the request or data.

This becomes especially important when learning prompt engineering and prompt injection.

---

# 6. What Is a Token?

LLMs do not process text exactly as human-readable words.

Text is converted into smaller units called **tokens**.

For example, this sentence:

```text
Node.js is great for backend development.
```

might conceptually become:

```text
[Node] [.js] [ is] [ great] [ for] [ backend] [ development] [.]
```

The exact tokenization depends on the tokenizer used by the model.

Tokens matter because they affect:

```text
tokens
  │
  ├── context limits
  ├── latency
  └── cost
```

Your application should therefore understand and monitor token usage.

---

# 7. Prompt Tokens, Completion Tokens, and Total Tokens

When you send text to a model, the input consumes tokens.

The model's generated answer also consumes tokens.

Conceptually:

```text
system message
      +
user message
      ↓
prompt tokens
      ↓
    model
      ↓
generated answer
      ↓
completion tokens
```

Then:

```text
prompt tokens
+
completion tokens
=
total tokens
```

The Groq response exposes token usage information that can be inspected by the backend.

Example:

```ts
console.log(response.usage);
```

---

# 8. What Is a Context Window?

The context window is the amount of information available to the model during a request.

Conceptually:

```text
┌──────────── Context Window ────────────┐
│                                       │
│ System instructions                   │
│ User input                            │
│ Conversation history                  │
│ Retrieved documents                   │
│ Tool results                          │
│ Generated output                      │
│                                       │
└───────────────────────────────────────┘
```

Later topics such as RAG will focus heavily on deciding what information should be placed into the model's context.

A useful mental model is:

```text
LLM
+
relevant context
+
tools
+
application logic
=
AI application
```

---

# 9. Reasoning Effort

For this project, the Groq request uses:

```ts
reasoning_effort: "low"
```

Reasoning effort controls how much reasoning work the model is encouraged to perform before producing the final response.

For simple Day 1 questions, low reasoning is sufficient.

Later, reasoning effort can be adjusted according to task complexity.

The main lesson is:

> More reasoning is not automatically better for every request.

Simple questions generally do not need expensive or deeper reasoning.

---

# 10. First Groq Request

The basic Groq integration looks like this:

```ts
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const response = await groq.chat.completions.create({
  model: "openai/gpt-oss-20b",

  messages: [
    {
      role: "user",
      content: "Explain Node.js.",
    },
  ],

  reasoning_effort: "low",
});

console.log(response.choices[0]?.message?.content);
console.log(response.usage);
```

The request flow is:

```text
Node.js
   │
   ▼
groq.chat.completions.create()
   │
   ▼
Groq API
   │
   ▼
openai/gpt-oss-20b
   │
   ▼
generated response
   │
   ▼
response.choices[0].message.content
```

---

# 11. Environment Variables and API Keys

The API key must not be hard-coded inside application source code.

Use:

```env
GROQ_API_KEY=your_api_key
```

Then load it from:

```ts
process.env.GROQ_API_KEY
```

For local development, `dotenv` is used.

```ts
import "dotenv/config";
```

The API key should never be committed to Git.

Example `.gitignore`:

```text
node_modules
.env
```

The important principle is:

> Secrets belong in environment configuration, not source code.

---

# 12. Lazy Groq Client Initialization

Initially, the Groq client was created at module import time:

```ts
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
```

This caused a problem in tests.

When Vitest imported the application, the Groq client was created immediately. If the environment variable had not been loaded yet, the entire test suite failed.

A better design is lazy initialization:

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
```

Then create the client only when an AI request is actually made:

```ts
export async function ask(input: string) {
  const groq = getGroqClient();

  // call the model...
}
```

This gives better separation:

```text
import app
    ↓
does not require Groq immediately

POST /ask
    ↓
ask()
    ↓
Groq client created
```

This is more test-friendly and reduces unnecessary initialization.

---

# 13. The `ask()` Service

The AI logic is kept separate from Express.

Example:

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

The goal is to keep AI-specific concerns inside `ai.ts`.

---

# 14. Express API

The CLI experiment was converted into a small Express HTTP API.

The basic endpoints are:

```text
GET /health
POST /ask
```

Example request:

```http
POST /ask
```

Body:

```json
{
  "question": "Explain the Node.js event loop."
}
```

Response:

```json
{
  "answer": "...",
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 100,
    "total_tokens": 120
  }
}
```

---

# 15. Separation Between `app.ts` and `server.ts`

One important architecture improvement was separating Express application creation from starting the HTTP server.

Project structure:

```text
src/
├── ai.ts
├── app.ts
└── server.ts
```

Responsibilities:

```text
app.ts
├── Express app
├── middleware
├── routes
├── validation
└── error handling

server.ts
└── starts listening on a port

ai.ts
├── Groq client
├── model selection
├── prompts/messages
└── AI response handling
```

This separation makes the application easier to test.

Tests can import:

```ts
import { app } from "../src/app";
```

without starting a real server.

---

# 16. Express Health Endpoint

Example:

```ts
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});
```

Request:

```bash
curl http://localhost:3000/health
```

Response:

```json
{
  "status": "ok"
}
```

A health endpoint helps verify that the HTTP service itself is running.

---

# 17. Express `/ask` Endpoint

Example:

```ts
app.post("/ask", async (req, res, next) => {
  try {
    const { question } = req.body;

    if (
      typeof question !== "string" ||
      question.trim().length === 0
    ) {
      return res.status(400).json({
        error: "question is required",
      });
    }

    const result = await ask(question);

    return res.json({
      answer: result.content,
      usage: result.usage,
    });
  } catch (error) {
    next(error);
  }
});
```

The request flow is:

```text
HTTP request
    ↓
Express
    ↓
validate question
    ↓
ask(question)
    ↓
Groq
    ↓
GPT-OSS
    ↓
result
    ↓
JSON response
```

---

# 18. Error Handling

Instead of handling every error completely inside each route, Express error middleware is used.

Example:

```ts
app.use(
  (
    error: Error,
    _req,
    res,
    _next,
  ) => {
    console.error(error);

    res.status(500).json({
      error: "Failed to generate response",
    });
  },
);
```

Then the route forwards unexpected errors:

```ts
next(error);
```

This keeps routes cleaner and centralizes HTTP error handling.

---

# 19. Why Important Business Rules Stay in Node.js

The model should not be trusted to enforce critical guarantees.

For example, this would be unsafe architecture:

```text
LLM
 ↓
"Transfer is allowed"
 ↓
send money
```

Instead:

```text
             LLM
              │
       understand intent
              │
              ▼
        Node.js logic
              │
      balance >= amount?
          ↙        ↘
        YES         NO
         ↓           ↓
      execute       reject
```

The principle is:

> Use the model for intelligence. Use deterministic code for guarantees.

Critical logic such as:

```text
authorization
payments
permissions
validation
business invariants
security checks
```

belongs in application code.

---

# 20. Prompt Experiments

Several prompts were tested to see how model behavior changes.

Example 1:

```text
Explain Node.js.
```

Example 2:

```text
Explain Node.js to a React developer
who has never built a backend.
```

Example 3:

```text
Explain Node.js in exactly three bullet points.
```

Example 4:

```text
Explain the Node.js event loop
to an experienced backend engineer.

Focus on I/O performance.
```

The lesson is:

```text
prompt design
      ↓
model behavior
      ↓
output quality
      ↓
application behavior
```

Changing audience, constraints, context, and output format changes the generated response.

---

# 21. Why Repeating Manual Calls Was Converted Into Tests

Initially, the same `ask()` function was called multiple times manually.

Example:

```ts
await ask("Explain Node.js.");

await ask(`
  Explain Node.js to a React developer.
`);

await ask(`
  Explain Node.js in exactly three bullet points.
`);
```

Instead, these experiments were moved into tests.

This provides:

```text
repeatability
automation
clear expectations
regression detection
```

It also introduces the idea of AI evaluation.

---

# 22. Vitest

Vitest is used as the test runner.

Install:

```bash
npm install -D vitest
```

Example scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Run:

```bash
npm test
```

For verbose output:

```bash
npx vitest run --reporter=verbose
```

The verbose reporter prints individual test cases rather than only summarizing fast tests.

---

# 23. AI Behavior Tests

LLM tests should generally avoid checking exact output strings.

Bad example:

```ts
expect(result.content).toBe(
  "Node.js is a JavaScript runtime..."
);
```

This is too strict because another valid response may use different wording.

Better:

```ts
expect(result.content.length).toBeGreaterThan(0);
```

or:

```ts
expect(
  result.content.toLowerCase(),
).toContain("i/o");
```

You can also test approximate constraints.

Example:

```ts
const words = result.content
  .trim()
  .split(/\s+/);

expect(words.length).toBeLessThanOrEqual(110);
```

The mindset is:

```text
Traditional test
      ↓
exact output


AI behavior test
      ↓
required behavior
```

---

# 24. Supertest

Supertest is used to test Express endpoints.

Install:

```bash
npm install -D supertest @types/supertest
```

Example:

```ts
import request from "supertest";

import { app } from "../src/app";

const response = await request(app)
  .get("/health");
```

No real server needs to be started.

Supertest can call the Express app directly.

---

# 25. Express API Tests

Example health test:

```ts
describe("GET /health", () => {
  it("returns status ok", async () => {
    const response = await request(app)
      .get("/health");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      status: "ok",
    });
  });
});
```

Validation test:

```ts
it(
  "returns 400 when question is missing",
  async () => {
    const response = await request(app)
      .post("/ask")
      .send({});

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      error: "question is required",
    });
  },
);
```

Other useful cases:

```text
missing question
empty string
whitespace-only question
valid question
Groq error
```

---

# 26. Real AI Test Timeout

A real Groq request may take longer than a normal unit test.

Vitest has a default timeout.

For external AI requests, a larger timeout may be needed:

```ts
it(
  "returns an AI response",
  async () => {
    // test
  },
  15_000,
);
```

This is another reason to distinguish normal API tests from external integration tests.

---

# 27. Loading Environment Variables in Vitest

The tests initially failed with:

```text
The GROQ_API_KEY environment variable is missing or empty.
```

The reason was that the environment file had not been loaded before `ai.ts` created the Groq client.

A shared setup file was introduced.

```text
tests/setup.ts
```

Contents:

```ts
import "dotenv/config";
```

Then:

```ts
// vitest.config.ts

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./tests/setup.ts"],
  },
});
```

This ensures the environment is initialized before tests run.

---

# 28. ESM Configuration Warning

Vitest/Vite produced a warning because the configuration file used ESM syntax while the package was interpreted as CommonJS.

The recommended project setup was to add:

```json
{
  "type": "module"
}
```

to `package.json`.

Alternatively, the Vitest config could use an `.mts` extension.

For this TypeScript project, using ESM throughout keeps the setup consistent with:

```ts
import ...
export ...
```

---

# 29. API Tests vs AI Integration Tests

One of the most important testing lessons from Day 1 is that these two concerns should eventually be separated.

Desired structure:

```text
tests/
├── app.test.ts
│     └── mocked AI service
│
└── ai.integration.test.ts
      └── real Groq request
```

Normal API tests should ideally be:

```text
fast
deterministic
offline-capable
independent of API quota
independent of Groq availability
```

AI integration tests can be:

```text
slower
network-dependent
variable
quota-consuming
```

This separation will become increasingly important as the project grows.

---

# 30. Why LLM Tests Are Not Normal Unit Tests

Traditional test:

```text
input
  ↓
function
  ↓
exact output
```

LLM evaluation:

```text
prompt
  ↓
model
  ↓
variable response
  ↓
check requirements
```

For example, an AI test might ask:

```text
Does the answer mention I/O?

Is it under roughly 100 words?

Is the output non-empty?

Does it satisfy the requested format?
```

This is the beginning of **AI evaluation**.

Later, this idea will expand into datasets, metrics, prompt comparison, and automated eval pipelines.

---

# 31. Current Project Structure

A clean structure at the end of Day 1 looks like:

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

Eventually:

```text
ai.test.ts
```

can be renamed to:

```text
ai.integration.test.ts
```

to make its purpose clearer.

---

# 32. Application Architecture

The current architecture is intentionally simple:

```text
                    Client
                      │
                      ▼
                 Express API
                      │
              input validation
                      │
                      ▼
                   ask()
                      │
                      ▼
                  Groq SDK
                      │
                      ▼
            openai/gpt-oss-20b
                      │
                      ▼
               model response
                      │
                      ▼
                 Express API
                      │
                      ▼
                 JSON response
```

No extra AI framework is needed yet.

---

# 33. Technologies Intentionally Not Used Yet

Day 1 does not need:

```text
LangChain
LangGraph
MCP
Agents
RAG
Embeddings
Vector databases
Fine-tuning
Multi-agent systems
```

The goal is to understand the primitives before learning abstractions.

You should first understand:

```text
Node.js
   ↓
LLM API
   ↓
prompt
   ↓
response
   ↓
testing
   ↓
HTTP service
```

before introducing frameworks.

---

# 34. Deployment Plan

The final Day 1 application should be deployed as a web service.

The selected option is Render.

The server should listen using:

```ts
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
```

Deployment flow:

```text
local project
    ↓
GitHub
    ↓
Render Web Service
    ↓
GROQ_API_KEY environment variable
    ↓
deployed Express API
```

After deployment, verify:

```text
GET /health
POST /ask
```

against the public URL.

---

# 35. Day 1 Completion Checklist

Completed so far:

```text
✅ Understand what an LLM is
✅ Understand deterministic vs probabilistic behavior
✅ Understand model selection conceptually
✅ Understand prompts
✅ Understand system vs user messages
✅ Understand tokens
✅ Understand token usage
✅ Understand context windows
✅ Understand reasoning effort conceptually
✅ Integrate Groq SDK
✅ Use openai/gpt-oss-20b
✅ Store GROQ_API_KEY in environment variables
✅ Inspect model responses
✅ Run different prompt experiments
✅ Create reusable ask() function
✅ Build Express API
✅ Add GET /health
✅ Add POST /ask
✅ Add request validation
✅ Add centralized error handling
✅ Separate app.ts and server.ts
✅ Install and configure Vitest
✅ Write AI behavior tests
✅ Install and use Supertest
✅ Write Express API endpoint tests
✅ Configure Vitest setup file
✅ Fix environment-variable loading issue
✅ Understand verbose Vitest reporter
✅ Understand why real AI tests are slower
```

Still recommended before Day 2:

```text
⬜ Mock ask() inside normal Express API tests
⬜ Separate real Groq tests into ai.integration.test.ts
⬜ Deploy the Express API to Render
⬜ Verify deployed /health endpoint
⬜ Verify deployed /ask endpoint
```

---

# 36. Day 1 Knowledge Check

Before moving to Day 2, you should be able to answer these questions without notes.

### AI fundamentals

1. What is an LLM?
2. What is a model?
3. What is a prompt?
4. What is a token?
5. What is a context window?
6. Why can LLM output vary?
7. What is reasoning effort conceptually?

### Application architecture

8. What is the difference between `system` and `user` messages?
9. Why does the API key belong in environment variables?
10. Why is the Groq client initialized lazily?
11. What should `ai.ts` be responsible for?
12. What should `app.ts` be responsible for?
13. Why is `server.ts` separate from `app.ts`?

### Testing

14. Why should you avoid exact string comparisons for most LLM tests?
15. Why are real Groq tests slower than normal API tests?
16. Why should normal Express tests mock the AI layer?
17. What role does Supertest play?
18. Why does `request(app)` not need a real listening port?
19. What does the Vitest setup file do?

### Backend engineering

20. Which responsibilities should stay deterministic in Node.js?
21. Why should an LLM not directly enforce critical business rules?
22. What happens from `POST /ask` until the response reaches the client?

---

# 37. The Most Important Day 1 Principle

The most important concept from Day 1 is:

> The LLM is a component of your backend. It is not your backend.

Your Node.js application still owns:

```text
authentication
authorization
input validation
business rules
database operations
security
HTTP behavior
error handling
retries
observability
application state
```

The model contributes capabilities such as:

```text
language understanding
generation
classification
summarization
reasoning
```

A robust AI application combines both.

---

# 38. Mental Model Going Forward

Traditional backend application:

```text
input
  ↓
deterministic logic
  ↓
output
```

AI application:

```text
input
  ↓
model
  ↓
probabilistic output
  ↓
validation
  ↓
deterministic application logic
  ↓
testing / evaluation
  ↓
reliable application behavior
```

This mental model will remain useful throughout the rest of the roadmap.

---

# 39. What Comes Next

After the remaining Day 1 tasks are completed, Day 2 focuses on **prompt engineering as application design**.

Topics will include:

```text
system instructions
user input
context
constraints
decision rules
few-shot examples
prompt structure
prompt injection
prompt versioning
```

Then Day 3 will move into:

```text
Structured Outputs
+
Zod
+
typed AI responses
```

The roadmap will eventually continue toward:

```text
tool calling
    ↓
embeddings
    ↓
RAG
    ↓
agents
    ↓
MCP
    ↓
evaluations
    ↓
observability
    ↓
production AI applications
```

---

# Day 1 Summary

Day 1 is about learning the smallest useful AI application architecture:

```text
Node.js
   +
Express
   +
Groq SDK
   +
openai/gpt-oss-20b
   +
Vitest
   +
Supertest
```

The key outcome is not simply that the model answers questions.

The key outcome is understanding how to place a probabilistic model inside a well-structured, testable, deterministic backend application.
