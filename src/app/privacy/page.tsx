import Link from "next/link";
import Image from "next/image";
import SocialFooterLinks from "@/components/layout/SocialFooterLinks";

export const dynamic = "force-static";

const SECTIONS = [
  {
    title: "۱. اطلاعاتی که جمع‌آوری می‌کنیم",
    body: "هنگام ثبت‌نام: نام، ایمیل یا شماره موبایل، و رمز عبور (به‌صورت هش‌شده و غیرقابل بازیابی ذخیره می‌شود). هنگام استفاده از خدمات: پیام‌های چت، محتوای تولیدشده، و لاگ مصرف اعتبار. هنگام پرداخت: اطلاعات تراکنش از طریق درگاه زرین‌پال (اطلاعات کارت بانکی شما هرگز روی سرورهای AiFekr ذخیره نمی‌شود). در صورت اتصال اختیاری حساب‌های شخص ثالث (وردپرس، اینستاگرام): توکن دسترسی محدود (Application Password یا Access Token) که فقط برای انجام عملیات درخواستی شما استفاده می‌شود.",
  },
  {
    title: "۲. نحوه‌ی استفاده از اطلاعات",
    body: "اطلاعات شما صرفاً برای ارائه و بهبود خدمات، پردازش پرداخت، ارسال اعلان‌های ضروری (تایید حساب، رسید پرداخت)، و پشتیبانی فنی استفاده می‌شود. پیام‌های چت شما ممکن است برای پردازش به provider های هوش مصنوعی (مانند Anthropic، DeepSeek، OpenAI) ارسال شوند تا پاسخ تولید شود؛ این ارسال فقط برای تولید پاسخ لحظه‌ای است.",
  },
  {
    title: "۳. اشتراک‌گذاری اطلاعات",
    body: "AiFekr اطلاعات شخصی شما را به هیچ شخص ثالثی برای اهداف تبلیغاتی نمی‌فروشد یا اجاره نمی‌دهد. اطلاعات فقط در موارد زیر با اشخاص ثالث در میان گذاشته می‌شود: (الف) provider های هوش مصنوعی برای پردازش درخواست شما، (ب) درگاه پرداخت زرین‌پال برای تکمیل تراکنش، (ج) در صورت الزام قانونی توسط مراجع ذی‌صلاح.",
  },
  {
    title: "۴. امنیت اطلاعات",
    body: "رمز عبور شما با الگوریتم هش یک‌طرفه ذخیره می‌شود و حتی تیم فنی AiFekr به آن دسترسی ندارد. ارتباط بین مرورگر شما و سرورهای AiFekr از طریق HTTPS رمزنگاری می‌شود. توکن‌های اتصال به حساب‌های شخص ثالث (وردپرس/اینستاگرام) در پایگاه‌داده‌ی داخلی نگهداری می‌شوند و در هیچ پاسخ API به‌صورت کامل نمایش داده نمی‌شوند.",
  },
  {
    title: "۵. مدت نگهداری اطلاعات",
    body: "اطلاعات حساب شما تا زمانی که حساب فعال است نگهداری می‌شود. در صورت درخواست حذف حساب، اطلاعات شخصی شما ظرف مدت معقول حذف می‌شود، به‌جز مواردی که طبق قانون (مانند سوابق مالی تراکنش‌ها) نگهداری آن‌ها الزامی است.",
  },
  {
    title: "۶. حقوق شما",
    body: "شما می‌توانید در هر زمان از طریق بخش «تنظیمات حساب» به اطلاعات خود دسترسی داشته باشید، آن‌ها را ویرایش کنید، یا درخواست حذف کامل حساب خود را از طریق پشتیبانی ارسال کنید. همچنین می‌توانید اتصال حساب‌های شخص ثالث (وردپرس/اینستاگرام) را در هر زمان از داشبورد قطع کنید.",
  },
  {
    title: "۷. کوکی‌ها",
    body: "AiFekr از کوکی برای مدیریت نشست ورود (session)، ذخیره‌ی ترجیحات (زبان، تم، واحد پول) استفاده می‌کند. این کوکی‌ها برای عملکرد صحیح سایت ضروری‌اند و شامل کوکی‌های تبلیغاتی شخص ثالث نمی‌شوند.",
  },
  {
    title: "۸. تغییرات این سیاست",
    body: "این سیاست حریم خصوصی ممکن است به‌مرور به‌روزرسانی شود. تغییرات مهم از طریق ایمیل یا اعلان داخل سایت به اطلاع شما خواهد رسید.",
  },
  {
    title: "۹. تماس با ما",
    body: "برای هرگونه سوال درباره‌ی حریم خصوصی یا درخواست حذف اطلاعات، از طریق صفحه‌ی «تماس با ما» با ما در ارتباط باشید.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" dir="rtl" style={{ background: "#0a0a0f", color: "#f5f5f5" }}>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: "rgba(10,10,15,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="AiFekr" width={32} height={32} className="rounded-lg" />
          <span className="font-bold text-lg text-white">AiFekr</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/terms" className="text-sm px-3 py-2 rounded-xl transition-all" style={{ color: "rgba(255,255,255,0.7)" }}>قوانین و مقررات</Link>
          <Link href="/privacy" className="text-sm px-3 py-2 rounded-xl transition-all" style={{ color: "#ea580c" }}>حریم خصوصی</Link>
          <Link href="/login" className="text-sm px-3 py-2 rounded-xl transition-all" style={{ color: "rgba(255,255,255,0.7)" }}>ورود</Link>
        </div>
      </nav>

      <section className="pt-40 pb-16 px-6 max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">حریم خصوصی</h1>
        <p className="text-sm mb-10" style={{ color: "rgba(255,255,255,0.5)" }}>آخرین به‌روزرسانی: تیر ۱۴۰۵</p>

        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-bold mb-2" style={{ color: "#ea580c" }}>{s.title}</h2>
              <p className="text-sm leading-7" style={{ color: "rgba(255,255,255,0.75)" }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-8 px-6 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <SocialFooterLinks />
      </footer>
    </div>
  );
}
