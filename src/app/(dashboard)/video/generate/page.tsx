"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { Video, Wand2, Loader2, CheckCircle, AlertCircle, Download, Play, Pause, Upload, X, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface PromptTemplate {
  id: string;
  title: string;
  titleEn: string | null;
  content: string;
  contentEn: string | null;
}

const STYLES = ["واقعی", "انیمیشن", "سینمایی", "کارتونی"];
const DURATIONS = [
  { label: "۵ ثانیه", value: 5, credits: 20 },
  { label: "۱۰ ثانیه", value: 10, credits: 35 },
  { label: "۳۰ ثانیه", value: 30, credits: 80 },
];
const RATIOS = ["16:9", "9:16", "1:1"];

type GenStatus = "idle" | "generating" | "polling" | "succeeded" | "failed";

export default function VideoGeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("واقعی");
  const [duration, setDuration] = useState(5);
  const [ratio, setRatio] = useState("16:9");
  const [status, setStatus] = useState<GenStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    fetch("/api/prompts?toolType=video")
      .then((r) => r.json())
      .then((d) => setTemplates(d.prompts || []))
      .catch(() => {});
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSourceImageUrl(data.url);
      toast.success("عکس آپلود شد / Photo uploaded");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "خطا در آپلود");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function pickTemplate(t: PromptTemplate) {
    setPrompt(t.content);
    setShowTemplates(false);
    fetch("/api/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: t.id }),
    }).catch(() => {});
  }

  useEffect(() => {
    if (status === "generating" || status === "polling") {
      const interval = setInterval(() => {
        setProgress(p => p >= 90 ? p : p + Math.random() * 2);
      }, 2000);
      return () => clearInterval(interval);
    }
    if (status === "succeeded") setProgress(100);
  }, [status]);

  useEffect(() => {
    if (!predictionId || status !== "polling") return;
    const poll = async () => {
      try {
        const res = await fetch(`/api/video/status?predictionId=${predictionId}&videoId=${videoId}`);
        const data = await res.json();
        if (data.status === "succeeded") {
          setVideoUrl(data.output);
          setStatus("succeeded");
          toast.success("ویدیو آماده شد! 🎬");
          clearInterval(pollRef.current);
        } else if (data.status === "failed") {
          setStatus("failed");
          clearInterval(pollRef.current);
        }
      } catch { /* keep polling */ }
    };
    poll();
    pollRef.current = setInterval(poll, 6000);
    return () => clearInterval(pollRef.current);
  }, [predictionId, videoId, status]);

  async function generate() {
    if (!prompt.trim()) return toast.error("توضیحات ویدیو را وارد کنید");
    setStatus("generating"); setProgress(5); setVideoUrl(null);
    const res = await fetch("/api/video/generate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, style, duration, ratio, sourceImageUrl }),
    });
    const data = await res.json();
    if (!res.ok) { setStatus("failed"); setProgress(0); return toast.error(data.error || "خطا در تولید ویدیو"); }
    setPredictionId(data.predictionId);
    setVideoId(data.videoId);
    setStatus("polling");
  }

  function togglePlay() {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); setPlaying(false); }
    else { videoRef.current.play(); setPlaying(true); }
  }

  async function downloadVideo() {
    if (!videoUrl) return;
    try {
      const res = await fetch(videoUrl);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = `video-${Date.now()}.mp4`; a.click();
    } catch { window.open(videoUrl, "_blank"); }
  }

  const isLoading = status === "generating" || status === "polling";

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>ساخت ویدیو با AI</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>ویدیوی دلخواه خود را با هوش مصنوعی بسازید</p>
      </div>

      {/* Reference photo upload */}
      <div className="p-5 rounded-2xl space-y-3" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
        <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          آپلود عکس مرجع (اختیاری) <span className="text-xs" style={{ color: "var(--text-muted)" }} dir="ltr">— Upload reference photo</span>
        </label>
        {sourceImageUrl ? (
          <div className="relative w-40">
            <img src={sourceImageUrl} alt="reference" className="w-40 h-24 object-cover rounded-xl" />
            <button onClick={() => setSourceImageUrl(null)} className="absolute top-1.5 left-1.5 p-1.5 rounded-lg bg-black/60 text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed text-xs font-medium transition-all disabled:opacity-50"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "در حال آپلود..." : "انتخاب عکس / Choose photo"}
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} className="hidden" />
      </div>

      {/* Ready-made prompt templates */}
      <div className="p-5 rounded-2xl space-y-3" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
        <button onClick={() => setShowTemplates((v) => !v)} className="w-full flex items-center justify-between text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" style={{ color: "var(--primary)" }} /> پرامپت‌های آماده <span className="text-xs" style={{ color: "var(--text-muted)" }} dir="ltr">Ready-made prompts</span></span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{showTemplates ? "بستن" : "مشاهده"}</span>
        </button>
        {showTemplates && (
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {templates.length === 0 && <p className="text-xs" style={{ color: "var(--text-muted)" }}>هنوز پرامپتی اضافه نشده</p>}
            {templates.map((t) => (
              <button key={t.id} onClick={() => pickTemplate(t)} className="w-full text-right p-2.5 rounded-xl text-xs transition-all" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>
                <div className="font-medium" style={{ color: "var(--text-primary)" }}>{t.title}</div>
                {t.titleEn && <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }} dir="ltr">{t.titleEn}</div>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 rounded-2xl space-y-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>توضیحات ویدیو</label>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} disabled={isLoading}
            placeholder="مثال: یک منظره آرام از ساحل دریا در غروب آفتاب..."
            className="w-full px-3 py-2.5 rounded-xl text-sm resize-none outline-none disabled:opacity-60"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>سبک</label>
          <div className="flex gap-2 flex-wrap">
            {STYLES.map(s => (
              <button key={s} onClick={() => setStyle(s)} disabled={isLoading}
                className="px-3 py-1.5 rounded-xl text-xs font-medium disabled:opacity-60"
                style={{ background: style === s ? "var(--primary)" : "var(--surface-2)", color: style === s ? "white" : "var(--text-secondary)" }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>مدت</label>
            <div className="space-y-2">
              {DURATIONS.map(d => (
                <button key={d.value} onClick={() => setDuration(d.value)} disabled={isLoading}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs disabled:opacity-60"
                  style={{ background: duration === d.value ? "var(--primary)" : "var(--surface-2)", color: duration === d.value ? "white" : "var(--text-secondary)" }}>
                  <span>{d.label}</span><span className="opacity-70">{d.credits} اعتبار</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>نسبت تصویر</label>
            <div className="space-y-2">
              {RATIOS.map(r => (
                <button key={r} onClick={() => setRatio(r)} disabled={isLoading}
                  className="w-full py-2 rounded-xl text-xs disabled:opacity-60"
                  style={{ background: ratio === r ? "var(--primary)" : "var(--surface-2)", color: ratio === r ? "white" : "var(--text-secondary)" }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={generate} disabled={isLoading || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white disabled:opacity-50"
          style={{ background: "var(--primary)" }}>
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
          {isLoading ? "در حال ساخت ویدیو..." : "ساخت ویدیو"}
        </button>
      </div>

      {/* Progress Bar */}
      {isLoading && (
        <div className="p-5 rounded-2xl space-y-3" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: "var(--text-secondary)" }}>
              {status === "generating" ? "ارسال درخواست..." : "در حال پردازش ویدیو..."}
            </span>
            <span style={{ color: "var(--primary)" }}>{Math.round(progress)}%</span>
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ height: "6px", background: "var(--surface-2)" }}>
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--primary), #f97316)" }} />
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>تولید ویدیو ۲ تا ۵ دقیقه طول می‌کشد. صفحه را نبندید.</p>
        </div>
      )}

      {/* Video Result */}
      {status === "succeeded" && videoUrl && (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <div className="relative bg-black">
            {videoUrl.includes("placehold.co") ? (
              <img src={videoUrl} alt="preview" className="w-full" />
            ) : (
              <>
                <video ref={videoRef} src={videoUrl} className="w-full" onEnded={() => setPlaying(false)} />
                <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)" }}>
                  {playing ? <Pause className="w-16 h-16 text-white opacity-80" /> : <Play className="w-16 h-16 text-white opacity-80" />}
                </button>
              </>
            )}
          </div>
          <div className="p-4 flex items-center justify-between" style={{ background: "var(--surface-1)" }}>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" style={{ color: "#10b981" }} />
              <span className="text-sm" style={{ color: "#10b981" }}>ویدیو آماده است</span>
            </div>
            <button onClick={downloadVideo} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: "var(--primary)" }}>
              <Download className="w-4 h-4" /> دانلود
            </button>
          </div>
        </div>
      )}

      {status === "failed" && (
        <div className="p-4 rounded-2xl flex items-center gap-3" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#ef4444" }} />
          <p className="text-sm flex-1" style={{ color: "#ef4444" }}>تولید ویدیو ناموفق بود. دوباره تلاش کنید.</p>
          <button onClick={() => setStatus("idle")} className="px-3 py-1 rounded-lg text-xs" style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444" }}>تلاش مجدد</button>
        </div>
      )}
    </div>
  );
}
