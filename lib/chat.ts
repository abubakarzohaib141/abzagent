// src/lib/chat.ts
import type { Message } from "@/types/chat";

export async function sendChat(messages: Message[]) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail || "Chat request failed");
  }

  return res.json();
}
