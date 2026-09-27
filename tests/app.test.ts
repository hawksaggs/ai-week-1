import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app";

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
    const response = await request(app).post("/ask").send({
      question: "Explain node.js in one sentence",
    });

    expect(response.status).toBe(200);
    expect(response.body.answer).toEqual(expect.any(String));
    expect(response.body.answer.length).toBeGreaterThan(0);
    expect(response.body.usage).toBeDefined();
  });
});
