import Groq from "groq-sdk";

export type AIErrorCode =
  | "AI_TIMEOUT"
  | "AI_RATE_LIMIT"
  | "AI_UNAVAILABLE"
  | "AI_UNKNOWN";

export class AIError extends Error {
  constructor(
    public code: AIErrorCode,
    message: string,
  ) {
    super(message);

    this.name = "AIError";
  }
}

export function translateGroqError(error: unknown): AIError {
  if (error instanceof Groq.APIConnectionTimeoutError)
    return new AIError("AI_TIMEOUT", "AI service timed out");

  if (error instanceof Groq.RateLimitError)
    return new AIError("AI_RATE_LIMIT", "AI service rate limit exceeded");

  if (
    error instanceof Groq.InternalServerError ||
    error instanceof Groq.APIConnectionError
  )
    return new AIError("AI_UNAVAILABLE", "AI service temporarily unavailable");

  return new AIError("AI_UNKNOWN", "AI service request failed");
}
