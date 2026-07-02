import { readFileSync } from "fs";
import { join } from "path";
import { getProviderById, getAvailableProviders, type Provider, type ChatMessage } from "./providers";

const CONFIG_PATH = join(process.cwd(), "src/lib/ai/provider-config.json");

function getDisabledProviders(): string[] {
  try {
    const data = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
    return data.disabled || [];
  } catch {
    return [];
  }
}

export function getEnabledProviders(): Provider[] {
  const disabled = getDisabledProviders();
  return getAvailableProviders().filter((p) => !disabled.includes(p.id));
}

const ROUTING_TABLE: Record<string, string[]> = {
  code: ["deepseek-v3", "gpt5", "deepseek-direct"],
  math: ["deepseek-v3", "deepseek-direct", "gpt5"],
  creative: ["gpt5", "openrouter", "gemini"],
  translation: ["gemini", "openrouter", "gpt5", "deepseek-v3"],
  business: ["gpt5", "openrouter", "gemini"],
  complex: ["gpt5", "openrouter", "deepseek-v3"],
  fast: ["gemini", "deepseek-direct", "deepseek-v3"],
  general: ["gpt5", "gemini", "openrouter", "deepseek-v3", "deepseek-direct"],
};

function detectCategory(message: string): string {
  const lower = message.toLowerCase();
  if (/\bcode\b|function|class|def |import |error|bug|debug|python|javascript|typescript|react|node/.test(lower)) return "code";
  if (/math|equation|calculate|integral|derivative|formula|solve/.test(lower)) return "math";
  if (/translat|ترجم|translate|english|persian|arabic|french/.test(lower)) return "translation";
  if (/story|poem|creative|write a|imagine|fiction|narrative/.test(lower)) return "creative";
  if (/business|strategy|market|revenue|startup|investor|b2b/.test(lower)) return "business";
  if (/analyze|explain in detail|comprehensive|research|compare/.test(lower)) return "complex";
  if (/quick|fast|brief|short|tldr|summary/.test(lower)) return "fast";
  return "general";
}

export function selectProvider(message: string): Provider | null {
  const category = detectCategory(message);
  const preferred = ROUTING_TABLE[category] || ROUTING_TABLE.general;
  const enabled = getEnabledProviders();
  for (const id of preferred) {
    const p = enabled.find((e) => e.id === id);
    if (p) return p;
  }
  return enabled[0] || null;
}

export async function routedStreamChat(
  messages: ChatMessage[],
  systemPrompt: string,
  onChunk: (text: string) => void,
  onProvider: (provider: Provider) => void,
  _model?: string
): Promise<void> {
  const { streamProvider } = await import("./providers");

  const lastUserMessage = messages.filter((m) => m.role === "user").slice(-1)[0]?.content || "";
  const category = detectCategory(lastUserMessage);
  const preferred = ROUTING_TABLE[category] || ROUTING_TABLE.general;
  const enabled = getEnabledProviders();

  const orderedIds = [
    ...preferred,
    ...enabled.map((p) => p.id).filter((id) => !preferred.includes(id)),
  ];

  let lastError: Error | null = null;

  for (const id of orderedIds) {
    const provider = enabled.find((p) => p.id === id);
    if (!provider) continue;

    try {
      onProvider(provider);
      await streamProvider(provider, messages, systemPrompt, onChunk);
      return;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`[Router] ${provider.name} also failed:`, lastError);
    }
  }

  throw lastError || new Error("All AI providers failed");
}