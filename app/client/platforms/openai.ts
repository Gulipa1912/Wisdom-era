"use client";
// 使用 OpenRouter API
import {
  ApiPath,
  REQUEST_TIMEOUT_MS,
  ServiceProvider,
} from "@/app/constant";
import {
  ChatMessageTool,
  useAccessStore,
  useAppConfig,
  useChatStore,
  usePluginStore,
} from "@/app/store";
import {
  preProcessImageContent,
  streamWithThink,
} from "@/app/utils/chat";
import { getClientConfig } from "@/app/config/client";
import {
  getMessageTextContent,
  getTimeoutMSByModel,
} from "@/app/utils";
import { fetch } from "@/app/utils/stream";

export interface RequestPayload {
  messages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[];
  stream?: boolean;
  model: string;
  temperature: number;
  presence_penalty: number;
  frequency_penalty: number;
  top_p: number;
  max_tokens?: number;
}

export class OpenRouterApi {
  path(path: string): string {
    let baseUrl = "https://openrouter.ai/api";
    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1);
    }
    console.log("[Proxy Endpoint] ", baseUrl, path);
    return [baseUrl, path].join("/");
  }

  async chat(options) {
    const modelConfig = {
      ...useAppConfig.getState().modelConfig,
      ...useChatStore.getState().currentSession().mask.modelConfig,
      ...{
        model: options.config.model,
      },
    };

    const messages = options.messages.map((v) => ({
      role: v.role,
      content: getMessageTextContent(v),
    }));

    const requestPayload: RequestPayload = {
      messages,
      stream: options.config.stream,
      model: modelConfig.model,
      temperature: modelConfig.temperature,
      presence_penalty: modelConfig.presence_penalty,
      frequency_penalty: modelConfig.frequency_penalty,
      top_p: modelConfig.top_p,
    };

    console.log("[Request] OpenRouter payload: ", requestPayload);

    const shouldStream = !!options.config.stream;
    const controller = new AbortController();
    options.onController?.(controller);

    try {
      const chatPath = this.path(ApiPath.OpenRouterChat);
      if (shouldStream) {
        streamWithThink(
          chatPath,
          requestPayload,
          {},
          [],
          [],
          controller,
          (text) => ({ isThinking: false, content: JSON.parse(text).choices?.[0]?.text || "" }),
          () => {},
          options,
        );
      } else {
        const res = await fetch(chatPath, {
          method: "POST",
          body: JSON.stringify(requestPayload),
          signal: controller.signal,
        });
        const resJson = await res.json();
        options.onFinish(resJson.choices?.[0]?.text || "", res);
      }
    } catch (e) {
      console.log("[Request] failed to make a chat request", e);
      options.onError?.(e);
    }
  }
}
