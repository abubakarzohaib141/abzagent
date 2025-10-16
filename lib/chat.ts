import type { Message } from "@/types/chat";

export async function sendChat(messages: Message[]) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    let err = "Chat request failed";
    try {
      const data = await res.json();
      err = data?.error || data?.detail || err;
    } catch {}
    throw new Error(err);
  }
  return res.json();
}
