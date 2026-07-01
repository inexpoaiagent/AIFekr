import { PROVIDERS, getAvailableProviders, streamProvider, type ChatMessage, type Provider } from "./providers";

// ─── Query type detection ────────────────────────────────────────────────────
type QueryType = "code" | "math" | "creative" | "translation" | "business" | "complex" | "fast" | "general";

const PATTERNS: Record<QueryType, RegExp> = {
  code: /\b(code|کد|python|javascript|typescript|java|sql|api|debug|function|class|error|bug|script|برنامه|الگوریتم|algorithm|html|css|react|next|git|bash|shell|deploy)\b/i,
  math: /\b(math|ریاضی|calculate|محاسبه|equation|معادله|integral|مشتق|matrix|ماتریس|probability|احتمال|statistics|آمار|formula|فرمول|\d+\s*[\+\-\*\/]\s*\d+)\b/i,
  creative: /\b(story|داستان|poem|شعر|creative|خلاق|write|بنویس|novel|رمان|song|آهنگ|lyrics|متن|script|فیلمنامه|imagine|تصور|design|طراح)\b/i,
  translation: /\b(translate|ترجمه|translation|ترجمه‌کن|به فارسی|به انگلیسی|to english|to persian|to arabic|به عربی)\b/i,
  business: /\b(business|کسب‌وکار|marketing|بازاریابی|strategy|استراتژی|startup|سرمایه|investment|finance|مالی|customer|مشتری|sales|فروش|brand|برند|plan|طرح)\b/i,
  complex: /\b(analyze|تحلیل|analysis|compare|مقایسه|research|تحقیق|explain|توضیح|philosophy|فلسفه|science|علم|detailed|جزئی|comprehensive|جامع)\b/i,
  fast: /\b(quick|سریع|brief|کوتاه|simple|ساده|yes|no|بله|خیر|what is|چیست|when|کی|who|کیست)\b/i,
  general: /.*/,
};

export function detectQueryType(message: string): QueryType {
  for (const [type, pattern] of Object.entries(PATTERNS) as [QueryType, RegExp][]) {
    if (type === "general") continue;
    if (pattern.test(message)) return type;
  }
  return "general";
}

// ─── Routing table: query type → provider priority list ─────────────────────
const ROUTING_TABLE: Record<QueryType, string[]> = {
  code:        ["deepseek-v3", "gpt5", "deepseek-direct", "claude-sonnet", "claude-haiku"],
  math:        ["deepseek-v3", "deepseek-direct", "gpt5", "claude-sonnet"],
  creative:    ["gpt5", "openrouter", "gemini", "claude-opus", "claude-sonnet"],
  translation: ["gemini", "openrouter", "gpt5", "deepseek-v3", "claude-sonnet"],
  business:    ["claude-sonnet", "gpt5", "openrouter", "claude-haiku"],
  complex:     ["gpt5", "claude-opus", "openrouter", "deepseek-v3", "claude-sonnet"],
  fast:        ["claude-haiku", "gemini", "deepseek-direct", "deepseek-v3"],
  general:     ["claude-sonnet", "gpt5", "gemini", "openrouter", "deepseek-v3", "claude-haiku"],
};

// ─── Pick best available provider for a query ────────────────────────────────
export function selectProvider(message: string, userPreferredModel?: string): Provider {
  const available = getAvailableProviders();
  const availableIds = new Set(available.map((p) => p.id));

  // If user explicitly picked a specific claude model, respect it
  if (userPreferredModel && userPreferredModel !== "auto") {
    const byModel = available.find((p) => p.model === userPreferredModel);
    if (byModel) return byModel;
  }

  const queryType = detectQueryType(message);
  const priority = ROUTING_TABLE[queryType];

  for (const id of priority) {
    if (availableIds.has(id)) {
      const provider = available.find((p) => p.id === id)!;
      return provider;
    }
  }

  // Final fallback — anything available
  return available[0] ?? PROVIDERS[0];
}

// ─── Stream with automatic fallback ─────────────────────────────────────────
export async function routedStreamChat(
  messages: ChatMessage[],
  systemPrompt: string,
  onChunk: (text: string) => void,
  onProviderSelected: (provider: Provider) => void,
  userPreferredModel?: string
): Promise<Provider> {
  const message = messages[messages.length - 1]?.content ?? "";
  const primary = selectProvider(message, userPreferredModel);
  onProviderSelected(primary);

  // Try primary
  try {
    await streamProvider(primary, messages, systemPrompt, onChunk);
    return primary;
  } catch (err) {
    console.warn(`[Router] ${primary.name} failed:`, err);
  }

  // Fallback chain — try all other available providers
  const available = getAvailableProviders().filter((p) => p.id !== primary.id);
  for (const fallback of available) {
    try {
      console.log(`[Router] Falling back to ${fallback.name}`);
      onProviderSelected(fallback);
      await streamProvider(fallback, messages, systemPrompt, onChunk);
      return fallback;
    } catch (err) {
      console.warn(`[Router] ${fallback.name} also failed:`, err);
    }
  }

  throw new Error("All AI providers failed");
}
