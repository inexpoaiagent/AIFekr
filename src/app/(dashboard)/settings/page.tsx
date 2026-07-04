"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Save, User, Lock, Trash2, CreditCard, BarChart3, Palette, Globe, Loader2, Users, UserPlus, Crown, X } from "lucide-react";
import toast from "react-hot-toast";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";

const AVATAR_EMOJIS = ["🙂", "😎", "🚀", "🧠", "🦊", "🐼", "🌟", "🔥", "🎯", "💼", "🧑‍💻", "👩‍💻"];

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  plan: string;
  credits: number;
  planExpiry: string | null;
  createdAt: string;
  authProvider: string;
}

interface UsageStats {
  byType: { type: string; count: number; totalCredits: number }[];
  totalCredits: number;
  days: number;
}

interface PaymentRow {
  id: string;
  amount: number;
  plan: string;
  status: string;
  gateway: string;
  refId: string | null;
  createdAt: string;
}

const STATUS_FA: Record<string, string> = { PENDING: "در انتظار", PAID: "پرداخت‌شده", FAILED: "ناموفق" };
const TYPE_FA: Record<string, string> = { chat: "چت", image: "تصویر", video: "ویدیو", music: "موزیک", tool: "ابزار" };

interface TeamMemberRow { id: string; name: string | null; email: string | null; avatar: string | null; role: string; joinedAt: string; }
interface TeamInviteRow { id: string; email: string; createdAt: string; expiresAt: string; }
interface TeamData {
  id: string; name: string; credits: number; maxSeats: number; planExpiry: string | null; isOwner: boolean;
  members: TeamMemberRow[]; invites: TeamInviteRow[];
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [team, setTeam] = useState<TeamData | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  function loadTeam() {
    fetch("/api/team", { credentials: "include" }).then((r) => r.json()).then((d) => setTeam(d.team || null));
  }

  useEffect(() => {
    fetch("/api/user/profile", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setProfile(d.user);
          setName(d.user.name || "");
          setAvatar(d.user.avatar || "");
        }
      });
    fetch("/api/user/usage", { credentials: "include" }).then((r) => r.json()).then(setUsage);
    fetch("/api/user/payments", { credentials: "include" }).then((r) => r.json()).then((d) => setPayments(d.payments || []));
    loadTeam();
  }, []);

  async function sendInvite() {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("دعوت‌نامه ارسال شد");
      setInviteEmail("");
      loadTeam();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در ارسال دعوت");
    } finally {
      setInviting(false);
    }
  }

  async function revokeInvite(id: string) {
    await fetch(`/api/team/invite/${id}`, { method: "DELETE", credentials: "include" });
    loadTeam();
  }

  async function removeMember(userId: string) {
    await fetch(`/api/team/members/${userId}`, { method: "DELETE", credentials: "include" });
    loadTeam();
  }

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, avatar }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("پروفایل ذخیره شد");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در ذخیره");
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    setSavingPassword(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("رمز عبور تغییر کرد");
      setCurrentPassword("");
      setNewPassword("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در تغییر رمز");
    } finally {
      setSavingPassword(false);
    }
  }

  async function deleteAccount() {
    if (!deleteConfirm) return setDeleteConfirm(true);
    setDeleting(true);
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("خطا در حذف حساب");
      window.location.href = "/";
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در حذف حساب");
      setDeleting(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>تنظیمات حساب</h1>

      {/* Profile */}
      <section className="p-5 rounded-2xl space-y-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <User className="w-5 h-5" style={{ color: "var(--primary)" }} />
          <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>اطلاعات شخصی</h2>
        </div>

        <div>
          <label className="block text-sm mb-2" style={{ color: "var(--text-secondary)" }}>آواتار</label>
          <div className="flex flex-wrap gap-2">
            {AVATAR_EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setAvatar(e)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all"
                style={{ background: avatar === e ? "var(--primary)" : "var(--surface-2)", border: "1px solid var(--border)" }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1.5" style={{ color: "var(--text-secondary)" }}>نام نمایشی</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="نام خود را وارد کنید"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
        </div>

        {profile && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>ایمیل / موبایل</div>
              <div style={{ color: "var(--text-primary)" }} dir="ltr">{profile.email || profile.phone || "—"}</div>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>پلن فعلی</div>
              <div style={{ color: "var(--primary)" }}>{profile.plan}</div>
            </div>
          </div>
        )}

        <button onClick={saveProfile} disabled={savingProfile}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50"
          style={{ background: "var(--primary)" }}>
          {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {savingProfile ? "در حال ذخیره..." : "ذخیره پروفایل"}
        </button>
      </section>

      {/* Appearance & Language */}
      <section className="p-5 rounded-2xl space-y-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5" style={{ color: "var(--primary)" }} />
          <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>ظاهر و زبان</h2>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <div className="text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>تم</div>
            <ThemeSwitcher />
          </div>
          <div className="flex-1">
            <div className="text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>زبان</div>
            <LanguageSwitcher />
          </div>
        </div>
      </section>

      {/* Password */}
      {profile?.authProvider !== "google" && (
        <section className="p-5 rounded-2xl space-y-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5" style={{ color: "var(--primary)" }} />
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>تغییر رمز عبور</h2>
          </div>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="رمز عبور فعلی"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" dir="ltr"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="رمز عبور جدید (حداقل ۶ کاراکتر)"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" dir="ltr"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          <button onClick={changePassword} disabled={savingPassword || !newPassword}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50"
            style={{ background: "var(--primary)" }}>
            {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {savingPassword ? "در حال ذخیره..." : "تغییر رمز"}
          </button>
        </section>
      )}

      {/* Usage stats */}
      <section className="p-5 rounded-2xl space-y-3" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" style={{ color: "var(--primary)" }} />
          <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>مصرف اعتبار (۳۰ روز اخیر)</h2>
        </div>
        {!usage || usage.byType.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>هنوز مصرفی ثبت نشده است</p>
        ) : (
          <div className="space-y-2">
            {usage.byType.map((u) => (
              <div key={u.type} className="flex items-center justify-between text-sm">
                <span style={{ color: "var(--text-secondary)" }}>{TYPE_FA[u.type] || u.type}</span>
                <span style={{ color: "var(--text-primary)" }}>{u.totalCredits} اعتبار ({u.count} بار)</span>
              </div>
            ))}
            <div className="pt-2 mt-2 flex items-center justify-between text-sm font-semibold" style={{ borderTop: "1px solid var(--border)" }}>
              <span style={{ color: "var(--text-primary)" }}>مجموع</span>
              <span style={{ color: "var(--primary)" }}>{usage.totalCredits} اعتبار</span>
            </div>
          </div>
        )}
      </section>

      {/* Payment history */}
      <section className="p-5 rounded-2xl space-y-3" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" style={{ color: "var(--primary)" }} />
          <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>تاریخچه‌ی پرداخت</h2>
        </div>
        {payments.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>هنوز پرداختی ثبت نشده است</p>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm p-2 rounded-xl" style={{ background: "var(--surface-2)" }}>
                <div>
                  <div style={{ color: "var(--text-primary)" }}>{p.plan}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{new Date(p.createdAt).toLocaleDateString("fa-IR")}</div>
                </div>
                <div className="text-left">
                  <div style={{ color: "var(--text-primary)" }}>{(p.amount / 10).toLocaleString("fa-IR")} ت</div>
                  <div className="text-xs" style={{ color: p.status === "PAID" ? "var(--success)" : p.status === "FAILED" ? "var(--danger)" : "var(--text-muted)" }}>
                    {STATUS_FA[p.status] || p.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Team management */}
      {team && (
        <section className="p-5 rounded-2xl space-y-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" style={{ color: "var(--primary)" }} />
              <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>{team.name}</h2>
            </div>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {team.members.length}/{team.maxSeats} نفر · {team.credits.toLocaleString("fa-IR")} اعتبار مشترک
            </span>
          </div>

          <div className="space-y-1.5">
            {team.members.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-sm p-2 rounded-xl" style={{ background: "var(--surface-2)" }}>
                <div className="flex items-center gap-2">
                  <span>{m.avatar || "👤"}</span>
                  <span style={{ color: "var(--text-primary)" }}>{m.name || m.email || "—"}</span>
                  {m.role === "OWNER" && <Crown className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />}
                </div>
                {team.isOwner && m.role !== "OWNER" && (
                  <button onClick={() => removeMember(m.id)} title="حذف از تیم">
                    <X className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {team.invites.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>دعوت‌های در انتظار</div>
              {team.invites.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between text-sm p-2 rounded-xl" style={{ background: "var(--surface-2)" }}>
                  <span dir="ltr" style={{ color: "var(--text-secondary)" }}>{inv.email}</span>
                  {team.isOwner && (
                    <button onClick={() => revokeInvite(inv.id)} title="لغو دعوت">
                      <X className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {team.isOwner && team.members.length + team.invites.length < team.maxSeats && (
            <div className="flex gap-2">
              <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="ایمیل عضو جدید" dir="ltr"
                className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              <button onClick={sendInvite} disabled={inviting || !inviteEmail.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                style={{ background: "var(--primary)" }}>
                {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                دعوت
              </button>
            </div>
          )}

          {!team.isOwner && profile && (
            <button onClick={() => removeMember(profile.id)}
              className="w-full py-2 rounded-xl text-sm font-medium"
              style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
              ترک تیم
            </button>
          )}
        </section>
      )}

      {/* Danger zone */}
      <section className="p-5 rounded-2xl space-y-3" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.25)" }}>
        <div className="flex items-center gap-2">
          <Trash2 className="w-5 h-5" style={{ color: "#ef4444" }} />
          <h2 className="font-semibold" style={{ color: "#ef4444" }}>حذف حساب کاربری</h2>
        </div>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          با حذف حساب، تمام گفتگوها، تصاویر، ویدیوها و موزیک‌های شما برای همیشه پاک می‌شوند. این عمل غیرقابل بازگشت است.
        </p>
        <button onClick={deleteAccount} disabled={deleting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50"
          style={{ background: "#ef4444" }}>
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          {deleting ? "در حال حذف..." : deleteConfirm ? "برای تأیید نهایی دوباره کلیک کنید" : "حذف حساب کاربری"}
        </button>
      </section>
    </div>
  );
}
