"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; text: string };

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Ask a rate question — engineered hours, room-only, day rate, deposit. I’ll answer from the published JaxCity card.",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      const data = await res.json();
      setMsgs((m) => [
        ...m,
        { role: "assistant", text: data.reply ?? "Could not price that — try another wording." },
      ]);
    } catch {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          text: "Connection issue. Call 904-536-7211 or email jaxcitystudios@gmail.com.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="no-print fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[min(28rem,70vh)] w-[min(22rem,calc(100vw-2rem))] flex-col border border-rule bg-charcoal">
          <div className="flex items-center justify-between border-b border-rule px-4 py-3">
            <p className="font-caps text-[18px]">Rate desk</p>
            <button
              type="button"
              className="font-caps text-[18px] text-muted"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-8 border border-rule bg-graphite p-3"
                    : "mr-4 text-paper-dim"
                }
              >
                {m.text}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form onSubmit={onSubmit} className="border-t border-rule p-3">
            <input
              className="input text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. 4 hours Mars with engineer"
              disabled={busy}
            />
          </form>
        </div>
      )}
      <button
        type="button"
        className="btn btn-solid"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Hide rates bot" : "Ask rates"}
      </button>
    </div>
  );
}
