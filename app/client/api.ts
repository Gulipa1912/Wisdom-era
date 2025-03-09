import { getClientConfig } from "../config/client";
import { ACCESS_CODE_PREFIX, ModelProvider, ServiceProvider } from "../constant";
import { ChatMessageTool, ChatMessage, ModelType, useAccessStore, useChatStore } from "../store";
import { ChatGPTApi, DalleRequestPayload } from "./platforms/openai";

export const ROLES = ["system", "user", "assistant"] as const;
export type MessageRole = (typeof ROLES)[number];

export const Models = ["gpt-3.5-turbo", "gpt-4"] as const;
export const TTSModels = ["tts-1", "tts-1-hd"] as const;
export type ChatModel = ModelType;

export interface MultimodalContent {
    type: "text" | "image_url";
    text?: string;
    image_url?: {
        url: string;
    };
}

export interface RequestMessage {
    role: MessageRole;
    content: string | MultimodalContent[];
}

export interface LLMConfig {
    model: string;
    providerName?: string;
    temperature?: number;
    top_p?: number;
    stream?: boolean;
    presence_penalty?: number;
    frequency_penalty?: number;
    size?: DalleRequestPayload["size"];
    quality?: DalleRequestPayload["quality"];
    style?: DalleRequestPayload["style"];
}

export interface SpeechOptions {
    model: string;
    input: string;
    voice: string;
    response_format?: string;
    speed?: number;
    onController?: (controller: AbortController) => void;
}

export interface ChatOptions {
    messages: RequestMessage[];
    config: LLMConfig;

    onUpdate?: (message: string, chunk: string) => void;
    onFinish: (message: string, responseRes: Response) => void;
    onError?: (err: Error) => void;
    onController?: (controller: AbortController) => void;
    onBeforeTool?: (tool: ChatMessageTool) => void;
    onAfterTool?: (tool: ChatMessageTool) => void;
}

export interface LLMUsage {
    used: number;
    total: number;
}

export interface LLMModel {
    name: string;
    displayName?: string;
    available: boolean;
    provider: LLMModelProvider;
    sorted: number;
}

export interface LLMModelProvider {
    id: string;
    providerName: string;
    providerType: string;
    sorted: number;
}

export abstract class LLMApi {
    abstract chat(options: ChatOptions): Promise<void>;
    abstract speech(options: SpeechOptions): Promise<ArrayBuffer>;
    abstract usage(): Promise<LLMUsage>;
    abstract models(): Promise<LLMModel[]>;
}

export class ClientApi {
    public llm: LLMApi;

    constructor(provider: ModelProvider = ModelProvider.GPT) {
        this.llm = new ChatGPTApi();
    }

    config() {}

    prompts() {}

    masks() {}
}

export function getBearerToken(apiKey: string, noBearer: boolean = false): string {
    return validString(apiKey) ? `${noBearer ? "" : "Bearer "}${apiKey.trim()}` : "";
}

export function validString(x: string): boolean {
    return x?.length > 0;
}

export function getHeaders(ignoreHeaders: boolean = false) {
    const accessStore = useAccessStore.getState();
    const chatStore = useChatStore.getState();
    let headers: Record<string, string> = {};
    if (!ignoreHeaders) {
        headers = {
            "Content-Type": "application/json",
            Accept: "application/json",
        };
    }

    const apiKey = accessStore.openaiApiKey;
    const bearerToken = getBearerToken(apiKey);

    if (bearerToken) {
        headers["Authorization"] = bearerToken;
    }

    return headers;
}

export function getClientApi(provider: ServiceProvider): ClientApi {
    return new ClientApi(ModelProvider.GPT);
}
