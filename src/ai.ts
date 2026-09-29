import Groq from "groq-sdk";
import { CLASSIFY_TICKET_PROMPT } from "./prompts/classify-ticket.prompt.js";

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is required");

  return new Groq({
    apiKey,
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

export async function classifyTicket(message: string) {
  const groq = getGroqClient();

  const response = await groq.chat.completions.create({
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
  });

  return response.choices[0]?.message?.content?.trim().toLowerCase() ?? "";
}
