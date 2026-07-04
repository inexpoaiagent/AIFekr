"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const packSlug = params.get("pack") || "";

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [packName, setPackName] = useState("");

  useEffect(() => {
    if (packSlug) {
      fetch(`/api/packs/${packSlug}`).then(r => r.json()).then(d => {
        if (d.pack) setPackName(`${d.pack.emoji} ${d.pack.name}`);
      }).catch(() => {});
    }
  }, [packSlug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("نام را وارد کنید");
    if (!form.email && !form.phone) return toast.error("ایمیل یا موبایل را وارد کنید");
    if (form.email && !form.password) return toast.error("رمز عبور را وارد کنید");
    if (form.password && form.password !== form.confirmPassword) return toast.error("رمزهای عبور مطابقت ندارند");
    if (form.password && form.password.length < 6) return toast.error("رمز عبور حداقل ۶ کاراکتر باشد");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email || undefined, phone: form.phone || undefined, password: form.password || undefined, industryPackSlug: packSlug || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("ثبت‌نام موفق! خوش آمدید");
      window.location.href = "/chat";
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "خطا در ثبت‌نام");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--surface-0)" }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, var(--primary), transparent)" }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--primary)" }}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>هوشمند AI</span>
          </div>
          <p style={{ color: "var(--text-secondary)" }}>ایجاد حساب کاربری جدید</p>
          {packName && (
            <div className="mt-3 px-4 py-2 rounded-xl inline-block" style={{ background: "rgba(234,88,12,0.1)", border: "1px solid rgba(234,88,12,0.3)" }}>
              <span className="text-sm" style={{ color: "var(--primary)" }}>بسته انتخابی: {packName}</span>
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "var(--text-secondary)" }}>نام و نام خانوادگی *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="مثال: علی رضایی" className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} required />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "var(--text-secondary)" }}>ایمیل</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="example@email.com" dir="ltr" className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "var(--text-secondary)" }}>موبایل</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="09123456789" dir="ltr" className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "var(--text-secondary)" }}>رمز عبور</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="حداقل ۶ کاراکتر" dir="ltr" className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-10"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {form.password && (
              <div>
                <label className="block text-sm mb-1.5" style={{ color: "var(--text-secondary)" }}>تکرار رمز عبور</label>
                <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="••••••••" dir="ltr" className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: "var(--primary)" }}>
              {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>یا</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>
          <a
            href="/api/auth/google"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.08-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33C2.44 15.98 5.48 18 9 18z" />
              <path fill="#FBBC05" d="M3.95 10.7c-.18-.54-.28-1.11-.28-1.7s.1-1.16.28-1.7V4.97H.96A8.997 8.997 0 000 9c0 1.45.35 2.83.96 4.03l2.99-2.33z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
            </svg>
            ثبت‌نام با گوگل
          </a>

          <p className="text-center text-sm mt-6" style={{ color: "var(--text-secondary)" }}>
            حساب دارید؟{" "}
            <Link href="/login" style={{ color: "var(--primary)" }} className="font-medium">وارد شوید</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
