import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"; // your Render URL in prod
const CHAT_URL = `${API_BASE.replace(/\/$/, "")}/v1/chat`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 60s timeout to survive Render cold start on free tier
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    const r = await fetch(CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    }).catch((e) => {
      throw new Error(`Proxy network error: ${e?.message || e}`);
    });
    clearTimeout(timeout);

    // Try to parse JSON; if not JSON, capture raw text for visibility
    const text = await r.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!r.ok) {
      const detail = data?.detail || data?.error || data?.message || data?.raw || text || "Unknown upstream error";
      return NextResponse.json(
        { error: `Upstream ${r.status}: ${detail}`, upstream: data },
        { status: r.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    const msg =
      e?.name === "AbortError"
        ? "Upstream timeout (60s) — Render cold start. Try again."
        : e?.message || "Proxy failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
