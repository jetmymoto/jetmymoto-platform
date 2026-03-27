import React, { useState, useCallback } from "react";
import { trackEvent } from "@/core/analytics/trackEvent";

const WEBHOOK_URL =
  import.meta.env.VITE_N8N_DOSSIER_WEBHOOK ||
  "https://n8n.jetmymoto.com/webhook/dossier";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function DossierLeadCapture({ airportCode }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const trimmed = email.trim();

      if (!EMAIL_RE.test(trimmed)) {
        setStatus("error");
        setErrorMsg("Enter a valid email address.");
        return;
      }

      setStatus("loading");
      setErrorMsg("");

      try {
        const res = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: trimmed,
            airportCode,
            timestamp: new Date().toISOString(),
            source: "patriot_page",
          }),
        });

        if (!res.ok) {
          throw new Error(`Server responded ${res.status}`);
        }

        setStatus("success");

        trackEvent("lead_dossier_request", {
          airport_code: airportCode,
          source: "patriot_page",
        });
      } catch {
        setStatus("error");
        setErrorMsg("Request failed. Try again.");
      }
    },
    [email, airportCode]
  );

  return (
    <section className="my-12 rounded-2xl border border-white/10 bg-[#121212] px-6 py-10 md:px-10">
      <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#CDA755] mb-3">
        Intelligence Package
      </p>

      <h3 className="text-2xl md:text-3xl font-serif italic font-black text-white uppercase leading-tight mb-4">
        Download the {airportCode} Tactical Deployment Dossier
      </h3>

      <p className="text-sm text-zinc-400 leading-relaxed max-w-xl mb-8">
        Get live pricing, fleet availability, and the Rent vs.&nbsp;Airlift
        break-even analysis sent directly to your comms.
      </p>

      {status === "success" ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4">
          <svg
            className="h-6 w-6 shrink-0 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium text-emerald-300">
            Dossier inbound — check your inbox.
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder="operator@callsign.com"
            aria-label="Email address"
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-[#CDA755]/60 focus:ring-1 focus:ring-[#CDA755]/40"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-lg bg-[#CDA755] px-6 py-3 text-sm font-bold uppercase tracking-wider text-black transition hover:bg-[#d4b66a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "Sending\u2026" : "Request Dossier"}
          </button>
        </form>
      )}

      {status === "error" && errorMsg && (
        <p className="mt-3 text-xs text-red-400">{errorMsg}</p>
      )}
    </section>
  );
}
