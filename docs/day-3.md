# Day 3 — Structured Outputs + Zod

Day 3 replaces loose text output with a typed, schema-constrained contract.

Day 2 taught the model what to do through prompts. Day 3 adds structural guarantees so the backend no longer has to trust arbitrary response formatting.

## Status

```text
✅ Complete
```

Final test result:

```text
Test Files  4 passed (4)
Tests      31 passed (31)
```

---

## Goal

Move from:

```text
billing
```

to:

```json
{
  "category": "billing",
  "confidence": 0.94,
  "reason": "The customer reports a duplicate charge."
}
```

Target flow:

```text
Customer message
      │
      ▼
classifyTicket()
      │
      ├── prompt
      ├── user input
      └── JSON Schema
              │
              ▼
          Groq API
              │
              ▼
     openai/gpt-oss-20b
              │
              ▼
       structured JSON
              │
              ▼
          JSON.parse()
              │
              ▼
           Zod.parse()
              │
              ▼
     typed TypeScript object
```

---

## Concepts Covered

### JSON vs JSON Schema

JSON is data. JSON Schema describes what JSON is valid.

### Zod

Zod validates unknown runtime data before the backend trusts it.

```ts
import { z } from "zod";

export const TicketCategorySchema = z.enum([
  "billing",
  "technical",
  "account",
  "general",
]);

export const TicketClassificationSchema = z.object({
  category: TicketCategorySchema,
  confidence: z.number().min(0).max(1),
  reason: z.string().min(1),
});
```

### `z.infer`

```ts
export type TicketClassification =
  z.infer<typeof TicketClassificationSchema>;
```

This keeps the runtime schema and TypeScript type aligned.

### JSON Schema

The model-side schema defines required fields, allowed enum values, field types, and disallows unexpected properties with `additionalProperties: false`.

### Structured Outputs

Structured Outputs constrain the model to return schema-shaped data instead of relying only on prose instructions.

### Strict Mode

Day 3 uses strict schema enforcement.

### `JSON.parse()`

The model returns serialized JSON text, which is parsed into a JavaScript value before Zod validation.

### `parse()` vs `safeParse()`

```text
parse()
→ returns validated data
→ throws on invalid input

safeParse()
→ returns success/error object
→ does not throw
```

### Model-reported confidence

A value such as `0.95` is model-reported confidence, not a statistically calibrated 95% probability of correctness.

---

## Why JSON Schema and Zod Both Exist

```text
model/provider boundary
        ↓
JSON Schema
        ↓
structured response
        ↓
application boundary
        ↓
Zod
        ↓
trusted typed object
```

JSON Schema constrains model output.

Zod validates the application boundary.

---

## Prompt Responsibilities

Day 3 moves structure out of the prompt.

```text
Prompt
→ semantic meaning

JSON Schema
→ structural contract

Zod
→ application validation
```

The prompt now explains things like what `confidence` and `reason` mean instead of trying to specify raw JSON syntax.

---

## Testing Layers

```text
schema.test.ts
    ↓
Zod only
fast + deterministic

app.test.ts
    ↓
Express
mocked AI
fast + deterministic

classify-ticket.integration.test.ts
    ↓
real Groq
real Structured Outputs
slower + external dependency
```

---

## Final Test Result

```text
Test Files  4 passed (4)
Tests      31 passed (31)
```

Covered:

```text
✅ schema tests
✅ Express endpoint tests
✅ generic AI integration tests
✅ clear classifier cases
✅ boundary cases
✅ messy user input
✅ prompt-injection cases
✅ ambiguous cases
```

The logged `Groq unavailable` message is expected because the Express test deliberately verifies the AI-service failure path.

---

## Completion Checklist

```text
✅ Zod schema exists
✅ TicketClassification uses z.infer
✅ equivalent JSON Schema exists
✅ response_format uses json_schema
✅ strict: true enabled
✅ every schema field required
✅ additionalProperties: false
✅ classifyTicket() returns TicketClassification
✅ model content parsed with JSON.parse()
✅ parsed result validated with Zod
✅ /tickets/classify returns structured object
✅ schema tests exist
✅ invalid category test exists
✅ invalid confidence test exists
✅ integration tests assert result.category
✅ integration tests check confidence bounds
✅ integration tests check non-empty reason
✅ full test suite passes
```

---

## Knowledge Check

You should be able to explain:

1. JSON vs JSON Schema.
2. JSON mode vs Structured Outputs.
3. Strict vs best-effort output.
4. Why `additionalProperties: false` matters.
5. Why fields are required in strict mode.
6. What a Zod schema does.
7. What `z.infer` does.
8. `parse()` vs `safeParse()`.
9. Why JSON Schema and Zod both exist.
10. Model-side enforcement vs app-side validation.
11. Why structure should not live only in prompts.
12. Why model confidence is not automatically calibrated probability.

---

## Git Checkpoint

Recommended branch:

```text
day-3-structured-outputs
```

Commit:

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

Day 4 focuses on reliability:

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

## Day 3 Mental Model

```text
Prompt
→ what the fields MEAN

JSON Schema
→ what the output MUST LOOK LIKE

Zod
→ what the application ACCEPTS

TypeScript
→ what the rest of the code can safely USE
```

Day 3 is complete.
