import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../src/app";
import { ask } from "../src/ai";
import { classifyTicket } from "../src/ai.js";
import { AIError } from "../src/ai.error.js";

vi.mock(import("../src/ai"), () => ({
  ask: vi.fn(),
  classifyTicket: vi.fn(),
}));

const mockedAsk = vi.mocked(ask);
const mockedClassifyTicket = vi.mocked(classifyTicket);

describe("GET /health", () => {
  it("return status ok", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
    });
  });
});

describe("POST /ask", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("return 400 when question is missing", async () => {
    const response = await request(app).post("/ask").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "question is required",
    });
  });

  it("return 400 when question is empty", async () => {
    const response = await request(app).post("/ask").send({
      question: "",
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "question is required",
    });
  });

  it("return 400 when question only contain whitespace", async () => {
    const response = await request(app).post("/ask").send({
      question: "    ",
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "question is required",
    });
  });

  it("return AI response", async () => {
    mockedAsk.mockResolvedValue({
      content: "Node.js is a JavaScript runtime.",
      usage: {
        prompt_tokens: 10,
        completion_tokens: 8,
        total_tokens: 18,
      },
    } as Awaited<ReturnType<typeof ask>>);

    const response = await request(app).post("/ask").send({
      question: "Explain Node.js",
    });

    expect(response.status).toBe(200);
    expect(response.body.answer).toBe("Node.js is a JavaScript runtime.");
    expect(response.body.usage).toEqual({
      prompt_tokens: 10,
      completion_tokens: 8,
      total_tokens: 18,
    });
    expect(mockedAsk).toHaveBeenCalledTimes(1);
    expect(mockedAsk).toHaveBeenCalledWith("Explain Node.js");
    // expect(response.body.answer).toEqual(expect.any(String));
    // expect(response.body.answer.length).toBeGreaterThan(0);
    // expect(response.body.usage).toBeDefined();
  });

  it("returns 500 when AI service fails", async () => {
    mockedAsk.mockRejectedValue(new Error("Groq unavailable"));

    const response = await request(app).post("/ask").send({
      question: "Explain Node.js",
    });

    expect(response.status).toBe(500);

    expect(response.body).toEqual({
      error: "Internal server error",
    });
  });
});

describe("POST /tickets/classify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("return 504 when AI timed out", async () => {
    mockedClassifyTicket.mockRejectedValue(
      new AIError("AI_TIMEOUT", "AI service timed out"),
    );

    const response = await request(app).post("/tickets/classify").send({
      message: "I was charged twice",
    });

    expect(response.status).toBe(504);
    expect(response.body).toEqual({
      error: "AI service timed out",
    });
  });

  it("returns 503 when AI is rate limited", async () => {
    mockedClassifyTicket.mockRejectedValue(
      new AIError("AI_RATE_LIMIT", "AI service rate limit exceeded"),
    );

    const response = await request(app).post("/tickets/classify").send({
      message: "I was charged twice",
    });

    expect(response.status).toBe(503);

    expect(response.body).toEqual({
      error: "AI service rate limit exceeded",
    });
  });

  it("returns 503 when AI service is unavailable", async () => {
    mockedClassifyTicket.mockRejectedValue(
      new AIError("AI_UNAVAILABLE", "AI service is temporarily unavailable"),
    );

    const response = await request(app).post("/tickets/classify").send({
      message: "I was charged twice",
    });

    expect(response.status).toBe(503);

    expect(response.body).toEqual({
      error: "AI service is temporarily unavailable",
    });
  });
});
