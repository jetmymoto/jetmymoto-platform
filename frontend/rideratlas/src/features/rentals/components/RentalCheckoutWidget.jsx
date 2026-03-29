import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  ShieldCheck,
  User,
  Mail,
  FileText,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  createCheckoutSession,
  createRentalReservation,
} from "@/services/bookingService";
import { buildRentalLegalAcknowledgement } from "@/features/rentals/utils/legalAcknowledgement";

const BROKER_RESERVATION_FEE = 50;
const BROKER_RESERVATION_FEE_CENTS = 5000;

const TIME_SLOTS = [];
for (let h = 9; h <= 18; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 18) TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

const INSURANCE_OPTIONS = [
  { value: "none", label: "No Insurance", desc: "Rider assumes liability" },
  { value: "basic", label: "Basic Cover", desc: "Third-party + theft" },
  { value: "premium", label: "Premium Shield", desc: "Zero excess, full protection" },
];

function getTomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function getDayAfterISO(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export default function RentalCheckoutWidget({ rental, operator, airport }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [error, setError] = useState("");

  const minPickup = getTomorrowISO();

  const [form, setForm] = useState({
    pickupDate: "",
    returnDate: "",
    pickupTime: "10:00",
    insuranceOption: "basic",
    riderName: "",
    contact: "",
    notes: "",
  });

  const minReturn = form.pickupDate ? getDayAfterISO(form.pickupDate) : minPickup;
  const legalAcknowledgement = buildRentalLegalAcknowledgement(operator, {
    brokerFeeLabel: "EUR 50",
  });

  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "pickupDate" && prev.returnDate && prev.returnDate <= value) {
        next.returnDate = getDayAfterISO(value);
      }
      return next;
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.pickupDate || !form.returnDate) {
      setError("Please select pickup and return dates.");
      return;
    }
    if (!form.contact) {
      setError("Contact email is required.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        rentalId: rental?.id || rental?.slug || "",
        rentalSlug: rental?.slug || "",
        airportCode: rental?.airportCode || rental?.airport || airport?.code || "",
        machineName: `${rental?.brand || ""} ${rental?.model || rental?.bikeName || rental?.slug || ""}`.trim(),
        operatorName: operator?.name || rental?.operatorId || rental?.operator || "",
        operatorId: operator?.id || rental?.operatorId || rental?.operator || "",
        pickupDate: form.pickupDate,
        returnDate: form.returnDate,
        contact: form.contact,
        riderName: form.riderName || undefined,
        insuranceOption: form.insuranceOption,
        pickupTime: form.pickupTime || undefined,
        notes: form.notes || undefined,
        legalAcknowledgement,
      };

      const res = await createRentalReservation(payload);

      if (res.success) {
        setBookingRef(res.bookingRef);
        const session = await createCheckoutSession({
          bookingRef: res.bookingRef,
          email: form.contact,
          amountCents: BROKER_RESERVATION_FEE_CENTS,
          currency: "eur",
          productName: "JetMyMoto Tactical Hardware Priority Reservation",
          productDescription: `${payload.machineName} @ ${payload.airportCode}`,
        });

        if (!session?.url) {
          throw new Error("No checkout URL returned");
        }

        window.location.href = session.url;
        setSubmitted(true);
      } else {
        setError(res.error || "Reservation failed. Please try again.");
      }
    } catch (err) {
      setError(err.message || "There was an error submitting your reservation.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success State ──
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[480px] flex flex-col items-center justify-center text-center px-6 py-16 bg-[#050505] rounded-[20px] border border-white/5"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-16 h-16 rounded-full border-2 border-[#CDA755] flex items-center justify-center mb-6"
        >
          <CheckCircle2 size={32} className="text-[#CDA755]" />
        </motion.div>

        <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-white font-serif italic">
          Hardware Secured
        </h2>
        <p className="mt-4 text-zinc-400 text-sm leading-relaxed max-w-md">
          Your reservation is confirmed. A Tactical Boarding Pass has been dispatched
          to <strong className="text-white">{form.contact}</strong>.
        </p>

        <div className="mt-8 inline-block px-6 py-3 border border-[#CDA755]/30 bg-[#0A0A0A] font-mono text-sm tracking-widest text-white">
          REF: <span className="text-[#CDA755]">{bookingRef}</span>
        </div>

        <div className="mt-8 space-y-3 text-left">
          {[
            "Reservation confirmed",
            "Dossier dispatched to your inbox",
            "Operator notified",
            "Present document at staging hub",
          ].map((step) => (
            <div key={step} className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-zinc-500">
              <CheckCircle2 size={14} className="text-[#CDA755] shrink-0" />
              {step}
            </div>
          ))}
        </div>

        <p className="mt-10 text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-600">
          €{BROKER_RESERVATION_FEE} priority reservation fee authorized
        </p>
      </motion.div>
    );
  }

  // ── Form State ──
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Dates Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold flex items-center gap-2">
            <Calendar size={12} className="text-[#CDA755]" /> Pickup Date
          </label>
          <input
            type="date"
            required
            min={minPickup}
            value={form.pickupDate}
            onChange={(e) => handleChange("pickupDate", e.target.value)}
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-4 font-mono text-sm text-white focus:border-[#CDA755] outline-none transition"
          />
        </div>
        <div className="space-y-2">
          <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold flex items-center gap-2">
            <Calendar size={12} className="text-[#CDA755]" /> Return Date
          </label>
          <input
            type="date"
            required
            min={minReturn}
            value={form.returnDate}
            onChange={(e) => handleChange("returnDate", e.target.value)}
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-4 font-mono text-sm text-white focus:border-[#CDA755] outline-none transition"
          />
        </div>
      </div>

      {/* ── Pickup Time ── */}
      <div className="space-y-2">
        <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold flex items-center gap-2">
          <Clock size={12} className="text-[#CDA755]" /> Pickup Time
        </label>
        <select
          value={form.pickupTime}
          onChange={(e) => handleChange("pickupTime", e.target.value)}
          className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-4 font-mono text-sm text-white focus:border-[#CDA755] outline-none transition appearance-none"
        >
          {TIME_SLOTS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* ── Insurance Toggle ── */}
      <div className="space-y-3">
        <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold flex items-center gap-2">
          <ShieldCheck size={12} className="text-[#CDA755]" /> Coverage Option
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {INSURANCE_OPTIONS.map((opt) => {
            const active = form.insuranceOption === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleChange("insuranceOption", opt.value)}
                className={`p-4 rounded-lg border text-left transition ${
                  active
                    ? "border-[#CDA755] bg-[#CDA755]/10"
                    : "border-white/10 bg-[#0A0A0A] hover:border-white/20"
                }`}
              >
                <div className={`text-xs font-bold uppercase tracking-widest ${active ? "text-[#CDA755]" : "text-zinc-400"}`}>
                  {opt.label}
                </div>
                <div className="text-[10px] font-mono text-zinc-600 mt-1">{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Rider Identity ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold flex items-center gap-2">
            <User size={12} className="text-[#CDA755]" /> Rider Name
          </label>
          <input
            type="text"
            placeholder="Commander call-sign..."
            value={form.riderName}
            onChange={(e) => handleChange("riderName", e.target.value)}
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-4 font-mono text-sm text-white placeholder:text-zinc-700 focus:border-[#CDA755] outline-none transition"
          />
        </div>
        <div className="space-y-2">
          <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold flex items-center gap-2">
            <Mail size={12} className="text-[#CDA755]" /> Contact Email
          </label>
          <input
            type="email"
            required
            placeholder="rider@command.ops"
            value={form.contact}
            onChange={(e) => handleChange("contact", e.target.value)}
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-4 font-mono text-sm text-white placeholder:text-zinc-700 focus:border-[#CDA755] outline-none transition"
          />
        </div>
      </div>

      {/* ── Mission Notes ── */}
      <div className="space-y-2">
        <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold flex items-center gap-2">
          <FileText size={12} className="text-[#CDA755]" /> Mission Notes
          <span className="text-zinc-700">(optional)</span>
        </label>
        <textarea
          rows={3}
          maxLength={500}
          placeholder="Special requests, luggage details, route intentions..."
          value={form.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-4 font-mono text-sm text-white placeholder:text-zinc-700 focus:border-[#CDA755] outline-none transition resize-none"
        />
      </div>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border border-red-500/30 bg-red-500/10 rounded-lg text-red-400 text-xs font-mono"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-5 bg-[#CDA755] text-[#050505] font-mono font-black uppercase tracking-[0.3em] text-sm hover:bg-[#d4b066] disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-lg flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(205,167,85,0.15)]"
      >
        {submitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Securing Hardware...
          </>
        ) : (
          <>
            Secure Machine — €{BROKER_RESERVATION_FEE} Reservation
            <ArrowRight size={18} />
          </>
        )}
      </button>

      <p className="text-center text-[10px] font-mono uppercase tracking-[0.22em] leading-5 text-zinc-600 font-bold">
        Your €{BROKER_RESERVATION_FEE} reservation deposit locks this machine.
        The remaining daily balance is paid directly to the verified operator at pickup.
      </p>
    </form>
  );
}
