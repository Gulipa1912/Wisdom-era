import { ApiPath } from "@/app/constant";
import { NextRequest } from "next/server";
import { handle as openaiHandler } from "../../openai";

async function handle(
  req: NextRequest,
  { params }: { params: { provider: string; path: string} },
) {
  const apiPath = `/api/${params.provider}`;
  console.log(`[${params.provider} Route] params `, params);

  if (apiPath === ApiPath.OpenAI) {
    return openaiHandler(req, { params }); 
  } else {
    // 對於其他 API 路徑，可以返回錯誤訊息或重定向
    return new Response("Unsupported API provider", { status: 400 });
  }
}

export const GET = handle;
export const POST = handle;

export const runtime = "edge";
export const preferredRegion = [
  "arn1",
  "bom1",
  "cdg1",
  "cle1",
  "cpt1",
  "dub1",
  "fra1",
  "gru1",
  "hnd1",
  "iad1",
  "icn1",
  "kix1",
  "lhr1",
  "pdx1",
  "sfo1",
  "sin1",
  "syd1",
];
