"use client";

import { useState } from "react";
import { Cpu, Zap, CheckCircle, XCircle, RefreshCw, Info, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const PROVIDERS = [
  {
    id: "claude-haiku",
    name: "Claude Haiku 4.5",
    provider: "Anthropic",
    model: "claude-haiku-4-5-20251001",
    envKey: "ANTHROPIC_API_KEY",
    description: "سریع‌ترین مدل برای کارهای روزمره. ارزان‌ترین گزینه.",
    strengths: ["fast", "general", "fa"],
    maxTokens: 4096,
    creditCost: 1,
    color: "#ea580c",
    logo: "🟠",
  },
  {
    id: "claude-sonnet",
    name: "Claude Sonnet 4.6",
    provider: "Anthropic",
    model: "claude-sonnet-4-6",
    envKey: "ANTHROPIC_API_KEY",
    description: "بهترین تعادل سرعت و کیفیت. پیش‌فرض برای کسب‌وکار.",
    strengths: ["business", "reasoning", "fa", "general"],
    maxTokens: 8192,
    creditCost: 3,
    color: "#ea580c",
    logo: "🟠",
  },
  {
    id: "claude-opus",
    name: "Claude Opus 4.8",
    provider: "Anthropic",
    model: "claude-opus-4-8",
    envKey: "ANTHROPIC_API_KEY",
    description: "قدرتمندترین مدل Anthropic برای تحلیل‌های پیچیده.",
    strengths: ["complex", "reasoning", "creative"],
    maxTokens: 16384,
    creditCost: 10,
    color: "#ea580c",
    logo: "🟠",
  },
  {
    id: "gpt5",
    name: "GPT-5",
    provider: "OpenAI (via GitHub)",
    model: "gpt-5",
    envKey: "GITHUB_TOKEN_GPT5",
    description: "جدیدترین و قوی‌ترین مدل OpenAI. بهترین برای کد و استدلال.",
    strengths: ["code", "reasoning", "creative", "complex"],
    maxTokens: 16384,
    creditCost: 5,
    color: "#10b981",
    logo: "🟢",
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "DeepSeek (via GitHub)",
    model: "DeepSeek-V3-0324",
    envKey: "GITHUB_TOKEN_DEEPSEEK",
    description: "قوی‌ترین مدل متن‌باز برای کد و ریاضیات.",
    strengths: ["code", "math", "technical", "reasoning"],
    maxTokens: 32768,
    creditCost: 2,
    color: "#3b82f6",
    logo: "🔵",
  },
  {
    id: "deepseek-direct",
    name: "DeepSeek Chat (Direct)",
    provider: "DeepSeek API",
    model: "deepseek-chat",
    envKey: "DEEPSEEK_API_KEY",
    description: "اتصال مستقیم به API رسمی DeepSeek. پشتیبان DeepSeek V3.",
    strengths: ["code", "math", "general"],
    maxTokens: 32768,
    creditCost: 2,
    color: "#3b82f6",
    logo: "🔵",
  },
  {
    id: "openrouter",
    name: "OpenRouter (Gemini 2.5 Pro)",
    provider: "OpenRouter",
    model: "google/gemini-2.5-pro-preview",
    envKey: "OPENROUTER_API_KEY",
    description: "دسترسی به صدها مدل AI از یک API. پیش‌فرض: Gemini 2.5 Pro.",
    strengths: ["creative", "translation", "general", "multimodal"],
    maxTokens: 32768,
    creditCost: 4,
    color: "#8b5cf6",
    logo: "🟣",
  },
  {
    id: "gemini",
    name: "Gemini 2.0 Flash",
    provider: "Google AI",
    model: "gemini-2.0-flash",
    envKey: "GEMINI_API_KEY",
    description: "سریع‌ترین مدل Google. بهترین برای ترجمه و محتوای خلاق.",
    strengths: ["creative", "translation", "fast", "factual"],
    maxTokens: 8192,
    creditCost: 1,
    color: "#f59e0b",
    logo: "🟡",
  },
];

const ROUTING_TABLE = [
  { type: "code / کد", primary: "DeepSeek V3", fallback: "GPT-5 → DeepSeek Direct → Claude Sonnet" },
  { type: "math / ریاضی", primary: "DeepSeek V3", fallback: "DeepSeek Direct → GPT-5 → Claude Sonnet" },
  { type: "creative / خلاق", primary: "GPT-5", fallback: "OpenRouter → Gemini → Claude Opus" },
  { type: "translation / ترجمه", primary: "Gemini", fallback: "OpenRouter → GPT-5 → DeepSeek V3" },
  { type: "business / کسب‌وکار", primary: "Claude Sonnet", fallback: "GPT-5 → OpenRouter → Claude Haiku" },
  { type: "complex / پیچیده", primary: "GPT-5", fallback: "Claude Opus → OpenRouter → DeepSeek V3" },
  { type: "fast / سریع", primary: "Claude Haiku", fallback: "Gemini → DeepSeek Direct" },
  { type: "general / عمومی", primary: "Claude Sonnet", fallback: "GPT-5 → Gemini → OpenRouter" },
];

const STRENGTH_LABELS: Record<string, string> = {
  code: "💻 کد",
  math: "🔢 ریاضی",
  creative: "🎨 خلاق",
  translation: "🌐 ترجمه",
  business: "💼 کسب‌وکار",
  complex: "🧠 پیچیده",
  fast: "⚡ سریع",
  general: "🌀 عمومی",
  reasoning: "🔍 استدلال",
  technical: "⚙️ تکنیکال",
  fa: "🇮🇷 فارسی",
  multimodal: "🖼 چندرسانه‌ای",
  factual: "📚 اطلاعاتی",
};

export default function LlmPage() {
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, "ok" | "fail">>({});

  async function testProvider(id: string, name: string) {
    setTesting(id);
    try {
      const res = await fetch(`/api/admin/llm/test?provider=${id}`, { credentials: "include" });
      const data = await res.json();
      if (data.ok) {
        setTestResults((p) => ({ ...p, [id]: "ok" }));
        toast.success(`${name} — اتصال موفق ✓`);
      } else {
        setTestResults((p) => ({ ...p, [id]: "fail" }));
        toast.error(`${name} — خطا: ${data.error || "ناموفق"}`);
      }
    } catch {
      setTestResults((p) => ({ ...p, [id]: "fail" }));
      toast.error(`${name} — خطای اتصال`);
    } finally {
      setTesting(null);
    }
  }

  const configured = PROVIDERS.filter((p) =>
    ["ANTHROPIC_API_KEY", "GITHUB_TOKEN_GPT5", "GITHUB_TOKEN_DEEPSEEK", "DEEPSEEK_API_KEY", "OPENROUTER_API_KEY", "GEMINI_API_KEY"]
      .includes(p.envKey)
  );

  return (
    <div className="p-6 space-y-8" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>مدیریت LLM</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          سیستم روتینگ هوشمند — بر اساس نوع سوال، بهترین AI انتخاب می‌شود
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "کل Provider ها", value: PROVIDERS.length, color: "#3b82f6" },
          { label: "Anthropic", value: 3, color: "#ea580c" },
          { label: "OpenAI / DeepSeek", value: 3, color: "#10b981" },
          { label: "Google / OpenRouter", value: 2, color: "#8b5cf6" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-2xl" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Routing table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="font-semibold text-sm flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Zap className="w-4 h-4" style={{ color: "var(--primary)" }} />
            جدول روتینگ هوشمند
          </h2>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            وقتی کاربر مدل «خودکار» را انتخاب می‌کند، سیستم بر اساس نوع سوال بهترین AI را انتخاب می‌کند
          </p>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {ROUTING_TABLE.map((row) => (
            <div key={row.type} className="px-5 py-3 flex items-center gap-4">
              <div className="w-40 text-xs font-mono shrink-0" style={{ color: "var(--text-secondary)" }}>{row.type}</div>
              <div className="flex items-center gap-2 flex-1">
                <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ background: "rgba(234,88,12,0.15)", color: "var(--primary)" }}>
                  {row.primary}
                </span>
                <ArrowRight className="w-3 h-3 shrink-0" style={{ color: "var(--text-muted)" }} />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{row.fallback}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Provider cards */}
      <div>
        <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--text-secondary)" }}>همه Provider ها</h2>
        <div className="grid grid-cols-1 gap-3">
          {PROVIDERS.map((p) => {
            const testResult = testResults[p.id];
            return (
              <div key={p.id} className="p-4 rounded-2xl flex items-start gap-4"
                style={{ background: "var(--surface-1)", border: `1px solid ${testResult === "ok" ? "#22c55e40" : testResult === "fail" ? "#ef444440" : "var(--border)"}` }}>

                {/* Logo */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ background: `${p.color}18` }}>
                  {p.logo}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{p.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
                      {p.provider}
                    </span>
                    {testResult === "ok" && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {testResult === "fail" && <XCircle className="w-4 h-4 text-red-500" />}
                  </div>
                  <p className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>{p.description}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                      {p.model}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>·</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {p.creditCost} اعتبار · {p.maxTokens.toLocaleString()} توکن
                    </span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    {p.strengths.map((s) => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-lg"
                        style={{ background: `${p.color}15`, color: p.color }}>
                        {STRENGTH_LABELS[s] ?? s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Env key + test button */}
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <span className="text-xs font-mono px-2 py-1 rounded-lg" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
                    {p.envKey}
                  </span>
                  <button
                    onClick={() => testProvider(p.id, p.name)}
                    disabled={testing === p.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                    style={{ background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                  >
                    <RefreshCw className={`w-3 h-3 ${testing === p.id ? "animate-spin" : ""}`} />
                    {testing === p.id ? "در حال تست..." : "تست اتصال"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info box */}
      <div className="p-4 rounded-2xl flex gap-3" style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
        <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#3b82f6" }} />
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: "#3b82f6" }}>نحوه کارکرد روتر هوشمند</p>
          <ul className="text-xs space-y-1" style={{ color: "var(--text-secondary)" }}>
            <li>• سیستم متن کاربر را تحلیل می‌کند و نوع سوال (کد، ریاضی، خلاق، ترجمه...) را تشخیص می‌دهد</li>
            <li>• بر اساس جدول روتینگ، بهترین AI انتخاب می‌شود</li>
            <li>• اگر AI اول خطا داد، به ترتیب fallback‌ها امتحان می‌شوند</li>
            <li>• نام AI انتخاب‌شده بالای چت‌باکس نمایش داده می‌شود</li>
            <li>• کاربر می‌تواند مدل خاصی را دستی انتخاب کند یا روی «خودکار» بگذارد</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
