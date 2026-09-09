"use client";

import Link from "next/link";
import { useState } from "react";

type Hit = {
  id: string;
  accessCode: string;
  status: string;
  revision: number;
  updatedAt: string;
  fill: { renterName: string; roomName: string; sessionDate: string };
};

export function AgreementLookupClient() {
  const [email, setEmail] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch(
        `/api/agreements?email=${encodeURIComponent(email)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lookup failed");
      setHits(data.agreements || []);
      if (!(data.agreements || []).length) {
        setError("No agreements found for that email.");
      }
    } catch (err) {
      setHits([]);
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <form onSubmit={lookup} className="space-y-3">
        <label className="block">
          <span className="font-caps text-[0.65rem] text-muted">
            Email on the agreement
          </span>
          <input
            type="email"
            className="input mt-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="btn btn-solid" disabled={busy}>
          {busy ? "Searching…" : "Find agreements"}
        </button>
      </form>
      {error && <p className="text-sm text-accent">{error}</p>}
      <ul className="space-y-3">
        {hits.map((h) => (
          <li key={h.id} className="border border-rule p-4">
            <p className="text-paper">
              {h.fill.renterName} · {h.fill.roomName} · {h.fill.sessionDate}
            </p>
            <p className="mt-1 font-caps text-[0.6rem] text-muted">
              {h.status} · rev {h.revision} · code {h.accessCode}
            </p>
            <Link
              href={`/agreement/${h.id}?code=${encodeURIComponent(h.accessCode)}`}
              className="mt-3 inline-block font-caps text-[0.7rem] text-cyan"
            >
              Open →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
