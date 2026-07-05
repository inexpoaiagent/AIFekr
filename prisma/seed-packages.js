const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const PACKAGES = [
  {
    planCode: "BASIC", name: "پایه", nameEn: "Basic", price: 1500000, duration: 30, credits: 2000,
    color: "#3b82f6", isFeatured: false, sortOrder: 1,
    features: ["چت نامحدود", "۵۰ تصویر در ماه", "۵ ویدیو در ماه", "مدل پیشرفته", "اولویت پردازش"].join("\n"),
  },
  {
    planCode: "PRO", name: "حرفه‌ای", nameEn: "Pro", price: 3500000, duration: 30, credits: 6000,
    color: "#ea580c", isFeatured: true, sortOrder: 2,
    features: ["همه‌چیز نامحدود", "مدل برتر", "پشتیبانی اولویت", "تصویر و ویدیو HD"].join("\n"),
  },
  {
    planCode: "TEAM", name: "تیمی", nameEn: "Team", price: 8000000, duration: 30, credits: 20000,
    color: "#8b5cf6", isFeatured: false, sortOrder: 3,
    features: ["تا ۵ نفر", "همه امکانات حرفه‌ای", "داشبورد مشترک", "مدیریت اعضا", "فاکتور رسمی"].join("\n"),
  },
];

async function main() {
  for (const p of PACKAGES) {
    await prisma.package.upsert({ where: { planCode: p.planCode }, update: p, create: p });
  }
  console.log("seeded", PACKAGES.length, "packages");
}

main().finally(() => prisma.$disconnect());
