// app/api/openai.ts

import { OpenAI } from "openai";
import { NextRequest } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
});

export async function handle(req: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const { messages, ...rest } = await req.json();

    const response = await client.chat.completions.create({
      ...rest,
      messages: messages,
      extra_headers: {
        "HTTP-Referer": "<YOUR_SITE_URL>",
        "X-Title": "<YOUR_SITE_NAME>",
      },
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[OpenRouter API] ", error);
    return new Response("OpenRouter API Error", { status: 500 });
  }
}
