import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";

import { ask } from "./ai";
import { classifyTicket } from "./ai.js";
import { AIError } from "./ai.error.js";

export const app = express();

// Parse application/json request bodies
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
  });
});

app.post("/ask", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { question } = req.body;

    if (typeof question !== "string" || question.trim().length === 0) {
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

app.post(
  "/tickets/classify",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { message } = req.body;

      if (typeof message !== "string" || message.trim().length === 0) {
        return res.status(400).json({
          error: "message is required",
        });
      }

      const result = await classifyTicket(message);

      return res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

// Error handler
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);

  if (error instanceof AIError) {
    switch (error.code) {
      case "AI_TIMEOUT":
        return res.status(504).json({
          error: error.message,
        });

      case "AI_RATE_LIMIT":
        return res.status(503).json({
          error: error.message,
        });

      case "AI_UNAVAILABLE":
        return res.status(503).json({
          error: error.message,
        });

      case "AI_UNKNOWN":
        return res.status(500).json({
          error: error.message,
        });
    }
  }
  return res.status(500).json({
    error: "Internal server error",
  });
});
