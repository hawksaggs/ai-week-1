import { describe, expect, test } from "vitest";
import {
  ambiguousCases,
  boundaryCases,
  clearCases,
  injectionCases,
  messyCases,
  TicketCase,
} from "./fixtures/ticket-case.js";
import { classifyTicket } from "../src/ai.js";

function runCases(cases: TicketCase[]) {
  test.for(cases)(
    "$name -> $expected",
    async ({ message, expected }) => {
      const result = await classifyTicket(message);

      expect(result.category).toBe(expected);

      expect(result.confidence).toBeGreaterThanOrEqual(0);

      expect(result.confidence).toBeLessThanOrEqual(1);

      expect(result.reason).toEqual(expect.any(String));

      expect(result.reason.length).toBeGreaterThan(0);
    },
    15_000,
  );
}

describe("Ticket classifier", () => {
  describe("clear cases", () => {
    runCases(clearCases);
  });

  describe("boundary cases", () => {
    runCases(boundaryCases);
  });

  describe("messy user input", () => {
    runCases(messyCases);
  });

  describe("prompt injection cases", () => {
    runCases(injectionCases);
  });

  describe("ambiguous cases", () => {
    runCases(ambiguousCases);
  });
});
