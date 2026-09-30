import { describe, expect, it } from "vitest";

import { TicketClassificationSchema } from "../src/schemas/ticket.schema.js";

describe("TicketClassificationSchema", () => {
  it("accepts valid classification", () => {
    const result = TicketClassificationSchema.parse({
      category: "billing",
      confidence: 0.95,
      reason: "Customer reports duplicate charge.",
    });

    expect(result.category).toBe("billing");
  });

  it("rejects invalid category", () => {
    expect(() =>
      TicketClassificationSchema.parse({
        category: "sales",
        confidence: 0.8,
        reason: "Something",
      }),
    ).toThrow();
  });

  it("rejects confidence above 1", () => {
    expect(() =>
      TicketClassificationSchema.parse({
        category: "billing",
        confidence: 1.5,
        reason: "Something",
      }),
    ).toThrow();
  });
});
