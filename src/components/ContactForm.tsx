"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fd.get("email"),
        phone: fd.get("phone"),
        stage: `contact:${fd.get("message")?.toString().slice(0, 120)}`,
      }),
    });
    setStatus("Got it — we’ll follow up from jaxcitystudios@gmail.com.");
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 border border-rule p-6">
      <p className="font-caps text-[0.65rem] text-muted">Message</p>
      <input className="input" name="name" placeholder="Name" required />
      <input
        className="input"
        name="email"
        type="email"
        placeholder="Email"
        required
      />
      <input className="input" name="phone" type="tel" placeholder="Phone" />
      <textarea
        className="textarea min-h-32"
        name="message"
        placeholder="What are you booking?"
        required
      />
      <button type="submit" className="btn btn-solid">
        Send
      </button>
      {status && <p className="text-sm text-paper-dim">{status}</p>}
    </form>
  );
}
