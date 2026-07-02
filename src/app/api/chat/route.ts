export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorizedResponse } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db/prisma";
import { routedStreamChat } from "@/lib/ai/router";
import type { Provider } from "@/lib/ai/providers";
import { CREDIT_COSTS } from "@/lib/utils/credits";

const DEFAULT_SYSTEM_FA = `تو یک دستیار هوش مصنوعی هستی. پاسخ‌هایت را به همان زبانی که کاربر صحبت می‌کند بده. اگر فارسی نوشت فارسی جواب بده، اگر انگلیسی نوشت انگلیسی. پاسخ‌هایت مفید، دقیق و کامل باشند.`;

async function getProjectContext(projectId: string, currentConvId: string | null): Promise<string> {
  try {
    const rows = await (prisma as any).$queryRaw`
      SELECT c.id, c.title, m.role, m.content, m.createdAt
      FROM Conversation c
      JOIN Message m ON m.conversationId = c.id
      WHERE c.projectId = ${projectId}
        AND c.id != ${currentConvId || ""}
      ORDER BY m.createdAt DESC
      LIMIT 40
    `;
    if (!rows || rows.length === 0) return "";
    // Group by conversation
    const byConv: Record<string, { title: string; msgs: { role: string; content: string }[] }> = {};
    for (const row of rows.reverse()) {
      if (!byConv[row.id]) byConv[row.id] = { title: row.title || "گفتگو", msgs: [] };
      byConv[row.id].msgs.push({ role: row.role, content: row.content?.slice(0, 300) || "" });
    }
    const parts = Object.values(byConv).slice(-3).map((conv) => {
      const preview = conv.msgs.slice(-4).map((m) => `${m.role === "user" ? "کاربر" : "دستیار"}: ${m.content}`).join("\n");
      return `[${conv.title}]\n${preview}`;
    });
    return parts.join("\n\n---\n\n");
  } catch { return ""; }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return unauthorizedResponse();

  if (user.credits < CREDIT_COSTS.chat) {
    return NextResponse.json({ error: "اعتبار کافی ندارید. لطفاً اعتبار خود را شارژ کنید" }, { status: 402 });
  }

  try {
    const { message, conversationId, model, history = [], systemPrompt, projectId } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "پیام خالی است" }, { status: 400 });
    }

    // Find or create conversation
    let convId = conversationId;
    let convProjectId = projectId || null;

    if (!convId) {
      const createData: any = {
        userId: user.id,
        title: message.slice(0, 50),
        model: model || "auto",
      };
      if (projectId) createData.projectId = projectId;
      const conv = await prisma.conversation.create({ data: createData });
      convId = conv.id;
    } else {
      // Load existing conv to get projectId
      const existing = await prisma.conversation.findUnique({ where: { id: convId }, select: { projectId: true } });
      if (existing?.projectId) convProjectId = existing.projectId;
    }

    // Build system prompt, inject project context if applicable
    let systemStr = systemPrompt || DEFAULT_SYSTEM_FA;
    if (convProjectId) {
      const projCtx = await getProjectContext(convProjectId, convId);
      if (projCtx) {
        systemStr = `${systemStr}\n\n== زمینه پروژه (مکالمات قبلی در همین پروژه) ==\n${projCtx}\n== پایان زمینه پروژه ==`;
      }
    }

    // Save user message
    await prisma.message.create({
      data: { conversationId: convId, role: "user", content: message },
    });

    // Deduct credit
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: CREDIT_COSTS.chat } },
    });

    // Build message history for the API
    const apiMessages = [
      ...history.slice(-10),
      { role: "user" as const, content: message },
    ];

    let assistantContent = "";
    let selectedProvider: Provider | null = null;

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          await routedStreamChat(
            apiMessages,
            systemStr,
            (text) => {
              assistantContent += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            },
            (provider) => {
              selectedProvider = provider;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ provider: provider.name })}\n\n`));
            },
            model
          );

          await prisma.message.create({
            data: { conversationId: convId, role: "assistant", content: assistantContent },
          });

          await prisma.usageLog.create({
            data: {
              userId: user.id,
              type: "chat",
              model: selectedProvider?.model ?? model ?? "auto",
              credits: CREDIT_COSTS.chat,
            },
          });

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ convId, projectId: convProjectId })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "خطا در دریافت پاسخ" })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Conversation-Id": convId,
      },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}