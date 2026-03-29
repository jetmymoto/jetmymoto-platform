import { useState } from "react";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

const WEBHOOK_URL = import.meta.env.VITE_N8N_DOSSIER_WEBHOOK;

export default function TacticalDossierTrap({ hubName = "Regional" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const handleUplink = async (e) => {
    e.preventDefault();
    if (!email || status !== "idle") return;

    setStatus("loading");

    const payload = {
      email,
      hubName,
      timestamp: new Date().toISOString(),
      sourceUrl: typeof window !== "undefined" ? window.location.pathname : "/",
    };

    try {
      if (!WEBHOOK_URL) {
        if (import.meta.env.DEV) {
          console.warn("[TacticalDossierTrap] VITE_N8N_DOSSIER_WEBHOOK not set — using mock simulation.");
        }
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } else {
        const res = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`Uplink failed (${res.status})`);
        }
      }

      setStatus("success");
      setEmail("");
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("[TacticalDossierTrap] Uplink error:", err);
      }
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="rounded-[28px] border border-white/10 bg-[#121212] p-8 lg:p-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] text-white relative overflow-hidden group">
      {/* Subtle mechanical gradient & grain */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.02)_0%,rgba(5,5,5,0.4)_100%)] opacity-50" />
      
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="mb-3 text-[10px] uppercase tracking-[0.34em] text-[#CDA755] font-semibold">
          Secure Logistics Intelligence
        </div>
        <h3 className="mb-4 font-serif text-3xl font-black tracking-tight text-white md:text-4xl">
          Download the {hubName} Tactical Deployment Dossier.
        </h3>
        <p className="mx-auto mb-8 max-w-2xl text-sm leading-7 text-zinc-400">
          Enter your email to receive a complete breakdown of staged fleet inventory, route telemetry, and the cost-analysis of renting locally vs. shipping your own machine.
        </p>

        <form onSubmit={handleUplink} className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status !== "idle"}
            placeholder="OPERATIVE EMAIL..."
            className="w-full flex-1 rounded-[16px] border border-white/10 bg-[#050505] px-5 py-4 text-sm font-medium text-white placeholder:text-zinc-600 focus:border-[#CDA755]/50 focus:outline-none focus:ring-1 focus:ring-[#CDA755]/50 disabled:opacity-50 transition-all duration-300 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
          />
          <button
            type="submit"
            disabled={status !== "idle"}
            className={`flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-[16px] px-8 py-4 text-[11px] font-black uppercase tracking-[0.24em] transition-all duration-500 disabled:cursor-not-allowed ${
              status === "success"
                ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                : status === "error"
                ? "bg-red-500/20 border border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                : status === "loading"
                ? "bg-[#CDA755]/50 border border-[#CDA755]/50 text-[#050505] shadow-[0_4px_20px_rgba(205,167,85,0.25)]"
                : "bg-[#CDA755] text-[#050505] hover:bg-[#F3E5C7] hover:shadow-[0_8px_30px_rgba(205,167,85,0.35)]"
            }`}
          >
            {status === "idle" && "[ INITIALIZE UPLINK ]"}
            {status === "loading" && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                TRANSMITTING...
              </>
            )}
            {status === "success" && (
              <>
                <CheckCircle2 className="h-4 w-4" />
                DOSSIER DISPATCHED
              </>
            )}
            {status === "error" && (
              <>
                <AlertTriangle className="h-4 w-4" />
                UPLINK FAILED
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
