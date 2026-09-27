import Groq from "groq-sdk";
import "dotenv/config";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function ask(input: string) {
  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
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

  console.log("\n======================");
  console.log("INPUT");
  console.log("======================");

  console.log(input);

  console.log("\n======================");
  console.log("OUTPUT");
  console.log("======================");

  console.log(response.choices[0]?.message?.content);

  console.log("\nTOKEN USAGE");
  console.log(response.usage);
}

async function main() {
  //   await ask("Explain Node.js");

  //   await ask(`
  //     Explain Node.js to a React developer
  //     who has never built a backend.
  //   `);

  //   await ask(`
  //     Explain Node.js in exactly three bullet points.
  //   `);

  //   await ask(`
  //     Explain the Node.js event loop
  //     to an experienced backend engineer.

  //     Focus on I/O performance.
  //   `);

  await ask(`A customer has ₹50,000 in their account.
        They request a transfer of ₹70,000.
        Should our banking API execute the transfer?
    `);
}

main().catch(console.error);
