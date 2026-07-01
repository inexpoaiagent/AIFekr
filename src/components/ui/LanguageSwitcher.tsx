"use client";

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";

type Lang = "fa" | "en";

function getLang(): Lang {
  if (typeof window === "undefined") return "fa";
  return (localStorage.getItem("lang") as Lang) || "fa";
}

function applyLang(lang: Lang) {
  localStorage.setItem("lang", lang);
  document.cookie = `lang=${lang}; path=/; max-age=31536000`;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  window.location.reload();
}

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const [lang, setLangState] = useState<Lang>("fa");

  useEffect(() => {
    setLangState(getLang());
  }, []);

  function toggle() {
    const next: Lang = lang === "fa" ? "en" : "fa";
    applyLang(next);
  }

  return (
    <button
      onClick={toggle}
      title={lang === "fa" ? "Switch to English" : "تغییر به فارسی"}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${className}`}
      style={{ background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
    >
      <Globe className="w-3.5 h-3.5" />
      <span>{lang === "fa" ? "EN" : "FA"}</span>
    </button>
  );
}
