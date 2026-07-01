export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorizedResponse } from "@/lib/auth/middleware";
import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "src/lib/ai/provider-config.json");

function readConfig(): { disabled: string[] } {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
  } catch {
    return { disabled: [] };
  }
}

function writeConfig(config: { disabled: string[] }) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return unauthorizedResponse();
  }
  return NextResponse.json(readConfig());
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return unauthorizedResponse();
  }

  const { providerId, enabled } = await req.json();
  if (!providerId) return NextResponse.json({ ok: false, error: "Missing providerId" }, { status: 400 });

  const config = readConfig();

  if (enabled) {
    config.disabled = config.disabled.filter((id) => id !== providerId);
  } else {
    if (!config.disabled.includes(providerId)) {
      config.disabled.push(providerId);
    }
  }

  writeConfig(config);
  return NextResponse.json({ ok: true, disabled: config.disabled });
}
