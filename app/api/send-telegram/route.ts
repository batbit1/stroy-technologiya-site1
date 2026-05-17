import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        { error: "Telegram env variables are missing" },
        { status: 500 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const projectType =
      typeof body.projectType === "string" ? body.projectType.trim() : "";
    const comment =
      typeof body.comment === "string" ? body.comment.trim() : "";

    const text = [
      "📩 Новая заявка с сайта",
      "",
      `👤 Имя: ${name || "Не указано"}`,
      `📞 Телефон: ${phone || "Не указано"}`,
      `🏗 Тип объекта: ${projectType || "Не указано"}`,
      `💬 Комментарий: ${comment || "Не указано"}`,
    ].join("\n");

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
        }),
        signal: AbortSignal.timeout(20_000),
      },
    );

    if (!telegramResponse.ok) {
      const errorText = await telegramResponse.text();
      console.error("[Telegram] error", errorText);

      return NextResponse.json(
        { error: "Telegram send failed", details: errorText },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[send-telegram] error", error);

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
