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
        "HTTP-Referer": "https://test4401.webnode.page/?_gl=1*1nbyivq*_gcl_au*MTk3NzM5MTEyMC4xNzM5MTU1NDY2",
        "X-Title": "智慧時代",
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
