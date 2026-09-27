import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function ask(input: string) {
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
