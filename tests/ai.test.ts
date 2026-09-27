import "dotenv/config";
import { describe, it, expect } from "vitest";

import { ask } from "../src/ai";

describe("AI Backend Teacher", () => {
  it("explain Node.js", async () => {
    const result = await ask("Explain Node.js");

    expect(result.content.length).toBeGreaterThan(0);
  });

  it("follow word limit approximately", async () => {
    const result = await ask(`
        Explain node.js event loop.

        Maximum 100 words.
    `);

    const words = result.content.trim().split(/\s+/);
    expect(words.length).toBeLessThanOrEqual(110);
  });

  it("explain node.js for backend engineer", async () => {
    const result = await ask(`
      Explain the Node.js event loop
      to an experienced backend engineer.

      Focus on I/O performance.
    `);

    expect(result.content.toLowerCase()).toContain("i/o");
  });
});
