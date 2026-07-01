import { streamChat as claudeStream } from "./claude";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface Provider {
  id: string;
  name: string;
  model: string;
  provider: string;
  baseURL: string;
  apiKey: string;
  strengths: string[];
  maxTokens: number;
  creditCost: number;
}

// ─── Provider registry ──────────────────────────────────────────────────────
export const PROVIDERS: Provider[] = [
  {
    id: "claude-haiku",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
    model: "claude-haiku-4-5-20251001",
    baseURL: "anthropic",
    apiKey: process.env.ANTHROPIC_API_KEY || "",
    strengths: ["general", "fa", "fast"],
    maxTokens: 4096,
    creditCost: 1,
  },
  {
    id: "claude-sonnet",
    name: "Claude Sonnet 4.6",
    provider: "anthropic",
    model: "claude-sonnet-4-6",
    baseURL: "anthropic",
    apiKey: process.env.ANTHROPIC_API_KEY || "",
    strengths: ["general", "business", "reasoning", "fa"],
    maxTokens: 8192,
    creditCost: 3,
  },
  {
    id: "claude-opus",
    name: "Claude Opus 4.8",
    provider: "anthropic",
    model: "claude-opus-4-8",
    baseURL: "anthropic",
    apiKey: process.env.ANTHROPIC_API_KEY || "",
    strengths: ["complex", "reasoning", "creative", "fa"],
    maxTokens: 16384,
    creditCost: 10,
  },
  {
    id: "gpt5",
    name: "GPT-5",
    provider: "openai",
    model: "gpt-5",
    baseURL: "https://models.inference.ai.azure.com",
    apiKey: process.env.GITHUB_TOKEN_GPT5 || "",
    strengths: ["code", "reasoning", "creative", "general", "complex"],
    maxTokens: 16384,
    creditCost: 5,
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "deepseek",
    model: "DeepSeek-V3-0324",
    baseURL: "https://models.inference.ai.azure.com",
    apiKey: process.env.GITHUB_TOKEN_DEEPSEEK || "",
    strengths: ["code", "math", "reasoning", "technical"],
    maxTokens: 32768,
    creditCost: 2,
  },
  {
    id: "deepseek-direct",
    name: "DeepSeek Chat (Direct)",
    provider: "deepseek",
    model: "deepseek-chat",
    baseURL: "https://api.deepseek.com/v1",
    apiKey: process.env.DEEPSEEK_API_KEY || "",
    strengths: ["code", "math", "general"],
    maxTokens: 32768,
    creditCost: 2,
  },
  {
    id: "openrouter",
    name: "OpenRouter (Gemini 2.5 Pro)",
    provider: "openrouter",
    model: "google/gemini-2.5-pro-preview",
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || "",
    strengths: ["creative", "general", "translation", "multimodal"],
    maxTokens: 32768,
    creditCost: 4,
  },
  {
    id: "gemini",
    name: "Gemini 2.0 Flash",
    provider: "google",
    model: "gemini-2.0-flash",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    apiKey: process.env.GEMINI_API_KEY || "",
    strengths: ["creative", "translation", "factual", "fast"],
    maxTokens: 8192,
    creditCost: 1,
  },
];

export function getProviderById(id: string): Provider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

export function getAvailableProviders(): Provider[] {
  return PROVIDERS.filter((p) => p.apiKey.length > 10);
}

// ─── OpenAI-compatible streaming (for non-Anthropic providers) ──────────────
export async function streamOpenAICompat(
  provider: Provider,
  messages: ChatMessage[],
  systemPrompt: string,
  onChunk: (text: string) => void
): Promise<void> {
  const body = JSON.stringify({
    model: provider.model,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    stream: true,
    max_tokens: provider.maxTokens,
    temperature: 0.7,
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${provider.apiKey}`,
  };

  // OpenRouter needs extra headers
  if (provider.provider === "openrouter") {
    headers["HTTP-Referer"] = "https://aifekr.com";
    headers["X-Title"] = "AiFekr";
  }

  const res = await fetch(`${provider.baseURL}/chat/completions`, {
    method: "POST",
    headers,
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${provider.name} error ${res.status}: ${err.slice(0, 200)}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) continue;
      const data = trimmed.slice(6);
      if (data === "[DONE]") return;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) onChunk(delta);
      } catch {
        // skip malformed chunks
      }
    }
  }
}

// ─── Unified stream entry point ──────────────────────────────────────────────
export async function streamProvider(
  provider: Provider,
  messages: ChatMessage[],
  systemPrompt: string,
  onChunk: (text: string) => void
): Promise<void> {
  if (provider.provider === "anthropic") {
    await claudeStream(messages, systemPrompt, provider.model, onChunk);
  } else {
    await streamOpenAICompat(provider, messages, systemPrompt, onChunk);
  }
}
