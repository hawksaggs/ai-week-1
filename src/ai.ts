import Groq from "groq-sdk";
import { CLASSIFY_TICKET_PROMPT } from "./prompts/classify-ticket.prompt.js";
import {
  TicketClassification,
  TicketClassificationJsonSchema,
  TicketClassificationSchema,
} from "./schemas/ticket.schema.js";
import { translateGroqError } from "./ai.error.js";

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is required");

  return new Groq({
    apiKey,
    // max no of attempt for retrying request after sending 1st request
    maxRetries: 2,
    // number of seconds to wait for api response before cancelling the request
    timeout: 10_000,
  });
}

export async function ask(input: string) {
  const groq = getGroqClient();
  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    reasoning_effort: "low",
    messages: [
      {
        role: "user",
        content: input,
      },
    ],
  });

  //   console.dir(response, {
  //     depth: null,
  //   });

  //   console.log("\n======================");
  //   console.log("INPUT");
  //   console.log("======================");

  //   console.log(input);

  //   console.log("\n======================");
  //   console.log("OUTPUT");
  //   console.log("======================");

  //   console.log(response.choices[0]?.message?.content);

  //   console.log("\nTOKEN USAGE");
  //   console.log(response.usage);

  return {
    content: response.choices[0]?.message?.content ?? "",
    usage: response.usage,
  };
}

export async function classifyTicket(
  message: string,
): Promise<TicketClassification> {
  const groq = getGroqClient();

  const startTime = Date.now();
  let response;
  try {
    response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      reasoning_effort: "low",
      messages: [
        {
          role: "system",
          content: CLASSIFY_TICKET_PROMPT,
        },
        {
          role: "user",
          content: message,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "ticket_classification",
          strict: true,
          schema: TicketClassificationJsonSchema,
        },
      },
    });

    const durationMs = Date.now() - startTime;

    console.log("AI request succeeded", {
      operation: "classify_ticket",
      provider: "groq",
      durationMs,
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;

    const aiError = translateGroqError(error);

    console.log("AI request failed", {
      operation: "classify_ticket",
      provider: "groq",
      durationMs,
      errorCode: aiError.code,
    });
    throw aiError;
  }

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Model returned empty response");

  const json = JSON.parse(content);

  return TicketClassificationSchema.parse(json);
}
