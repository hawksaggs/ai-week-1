import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../src/app";
import { ask } from "../src/ai";

vi.mock(import("../src/ai"), () => ({
  ask: vi.fn(),
}));

const mockedAsk = vi.mocked(ask);

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
      error: "Failed to generate response",
    });
  });
});
