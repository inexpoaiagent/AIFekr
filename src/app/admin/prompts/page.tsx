"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { HelpCircle, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface Prompt {
  id: string;
  title: string;
  titleEn: string | null;
  content: string;
  contentEn: string | null;
  category: string;
  toolType: string;
  thumbnailUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  usedCount: number;
}

const TOOL_TYPES = [
  { value: "chat", label: "چت" },
  { value: "image", label: "تولید تصویر" },
  { value: "video", label: "تولید ویدیو" },
];

const CATEGORIES = ["عمومی", "کسب‌وکار", "آموزش", "سلامت", "فناوری", "هنر و خلاقیت", "سفر", "مالی"];

const EMPTY_FORM = { title: "", titleEn: "", content: "", contentEn: "", category: "عمومی", toolType: "chat" };

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [toolFilter, setToolFilter] = useState("chat");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Prompt | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/prompts?toolType=${toolFilter}`, { credentials: "include" });
      const data = await res.json();
      setPrompts(data.prompts || []);
    } catch {
      toast.error("خطا در بارگذاری");
    } finally {
      setLoading(false);
    }
  }, [toolFilter]);

  useEffect(() => { load(); }, [load]);

  function openAdd() { setEditing(null); setForm({ ...EMPTY_FORM, toolType: toolFilter }); setShowForm(true); }
  function openEdit(p: Prompt) {
    setEditing(p);
    setForm({ title: p.title, titleEn: p.titleEn || "", content: p.content, contentEn: p.contentEn || "", category: p.category, toolType: p.toolType });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title || !form.content) return toast.error("عنوان و محتوای فارسی الزامی است");
    try {
      if (editing) {
        await fetch("/api/admin/prompts", {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...form }),
        });
        toast.success("پرامپت آپدیت شد");
      } else {
        await fetch("/api/admin/prompts", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        toast.success("پرامپت اضافه شد");
      }
      setShowForm(false);
      load();
    } catch {
      toast.error("خطا در ذخیره");
    }
  }

  async function toggleActive(p: Prompt) {
    await fetch("/api/admin/prompts", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, isActive: !p.isActive }),
    });
    load();
  }

  async function deletePrompt(id: string) {
    if (!confirm("حذف شود؟")) return;
    await fetch("/api/admin/prompts", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    toast.success("حذف شد");
    load();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <HelpCircle className="w-5 h-5" style={{ color: "var(--primary)" }} />
            پرامپت‌های آماده
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            مدیریت پرامپت‌های پیش‌فرض چت، تولید تصویر و تولید ویدیو — دوزبانه (فارسی/انگلیسی)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} disabled={loading} className="p-2 rounded-lg disabled:opacity-50" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: "var(--primary)" }}>
            <Plus className="w-4 h-4" /> افزودن پرامپت
          </button>
        </div>
      </div>

      {/* Tool type tabs */}
      <div className="flex gap-2">
        {TOOL_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setToolFilter(t.value)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: toolFilter === t.value ? "var(--primary)" : "var(--surface-1)", color: toolFilter === t.value ? "white" : "var(--text-secondary)", border: "1px solid var(--border)" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "کل پرامپت‌ها", value: prompts.length, color: "#3b82f6" },
          { label: "فعال", value: prompts.filter((p) => p.isActive).length, color: "#10b981" },
          { label: "کل استفاده", value: prompts.reduce((s, p) => s + p.usedCount, 0), color: "#f59e0b" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-2xl" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value.toLocaleString("fa-IR")}</div>
            <div className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {prompts.length === 0 && !loading && (
          <p className="text-center py-10 text-sm" style={{ color: "var(--text-muted)" }}>هنوز پرامپتی برای این بخش اضافه نشده</p>
        )}
        {prompts.map((p) => (
          <div key={p.id} className="p-4 rounded-2xl" style={{ background: "var(--surface-1)", border: "1px solid var(--border)", opacity: p.isActive ? 1 : 0.6 }}>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{p.title}</span>
                  {p.titleEn && <span className="text-xs" style={{ color: "var(--text-muted)" }} dir="ltr">{p.titleEn}</span>}
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>{p.category}</span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{p.usedCount} بار استفاده</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{p.content}</p>
                {p.contentEn && <p className="text-xs leading-relaxed mt-1" style={{ color: "var(--text-muted)" }} dir="ltr">{p.contentEn}</p>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toggleActive(p)} className="p-1.5 rounded-lg" style={{ color: p.isActive ? "#10b981" : "#ef4444" }}>
                  {p.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }}><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => deletePrompt(p.id)} className="p-1.5 rounded-lg" style={{ color: "#ef4444" }}><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-lg rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
            <h2 className="font-bold" style={{ color: "var(--text-primary)" }}>{editing ? "ویرایش پرامپت" : "افزودن پرامپت جدید"}</h2>

            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>برای کدام ابزار؟</label>
              <select value={form.toolType} onChange={(e) => setForm((p) => ({ ...p, toolType: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                {TOOL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>عنوان (فارسی)</label>
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="عنوان کوتاه و گویا"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Title (English)</label>
              <input dir="ltr" value={form.titleEn} onChange={(e) => setForm((p) => ({ ...p, titleEn: e.target.value }))} placeholder="Short, clear title"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>محتوای پرامپت (فارسی)</label>
              <textarea value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} rows={3}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Prompt Content (English)</label>
              <textarea dir="ltr" value={form.contentEn} onChange={(e) => setForm((p) => ({ ...p, contentEn: e.target.value }))} rows={3}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>

            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>دسته‌بندی</label>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} className="flex-1 py-2 rounded-xl font-semibold text-sm text-white" style={{ background: "var(--primary)" }}>ذخیره</button>
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl text-sm" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>انصراف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
