"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, User, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPanel({
  analysisId,
}: {
  analysisId: string | null;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setBusy(true);
    setError(null);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    const mode = analysisId ? "image" : "general";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, mode, analysisId }),
      });
      if (!res.ok || !res.body) throw new Error("Chat request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6);
          const obj = JSON.parse(raw);
          if (obj.text) {
            setMessages((m) => {
              const next = [...m];
              next[next.length - 1] = {
                role: "assistant",
                content: next[next.length - 1].content + obj.text,
              };
              return next;
            });
          }
          if (obj.error) setError(obj.error);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card flex h-[500px] flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Bot className="h-5 w-5 text-primary" />
        <span className="font-semibold">Doctor Plant Assistant</span>
        <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-c">
          <Sparkles className="h-3.5 w-3.5" />
          {analysisId ? "Talking about your plant" : "General plant care"}
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-muted-c">
            {analysisId
              ? "Ask anything about this analysis — treatments, timing, organic options…"
              : "Ask general plant care questions, e.g. \"How do I treat powdery mildew?\" or \"Why are my lemon leaves yellowing?\""}
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.role === "assistant" && (
              <span className="mt-1 rounded-full bg-muted p-1.5">
                <Bot className="h-4 w-4" />
              </span>
            )}
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "user"
                  ? "rounded-tr-sm bg-primary text-on-primary"
                  : "rounded-tl-sm bg-muted"
              }`}
            >
              {m.content || (busy && i === messages.length - 1 ? "…" : "")}
            </div>
            {m.role === "user" && (
              <span className="mt-1 rounded-full bg-primary/10 p-1.5">
                <User className="h-4 w-4 text-primary" />
              </span>
            )}
          </div>
        ))}
        {error && (
          <p className="text-sm font-medium text-danger">{error}</p>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Type your question…"
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            onClick={send}
            disabled={busy || !input.trim()}
            className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-xl btn-primary disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
