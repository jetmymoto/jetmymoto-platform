import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Database,
  RadioTower,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";

import { GRAPH } from "@/core/network/networkGraph";

const MOCK_LEADS = [
  {
    id: "lead-log-01",
    riderName: "Anna Keller",
    bookingRef: "JMM-24031",
    requestMode: "logistics",
    airportHub: "MXP",
    status: "PENDING_QUOTE",
    pickupCity: "Munich",
    destinationCity: "Milan",
  },
  {
    id: "lead-log-02",
    riderName: "Luc Martin",
    bookingRef: "JMM-24032",
    requestMode: "logistics",
    airportHub: "BCN",
    status: "READY_FOR_DISPATCH",
    pickupCity: "Paris",
    destinationCity: "Barcelona",
  },
  {
    id: "lead-ren-01",
    riderName: "Sara Holt",
    bookingRef: "RA-88011",
    requestMode: "rental",
    airportHub: "DEN",
    status: "PENDING_QUOTE",
    rentalId: "harley-road-glide-den-eagle-rider-den",
    selectedRentalMachine: "Harley-Davidson Road Glide",
  },
  {
    id: "lead-ren-02",
    riderName: "Marco Vitale",
    bookingRef: "RA-88012",
    requestMode: "rental",
    airportHub: "LIS",
    status: "READY_FOR_DISPATCH",
    rentalId: "bmw-r1250gs-lis-hertz-ride-lisbon",
    selectedRentalMachine: "BMW R1250 GS",
  },
];

const LOGISTICS_QUOTE_BLUEPRINT = `{
  "bookingRef": "JMM-24031",
  "requestMode": "logistics",
  "estimatedPrice": 4680,
  "currency": "EUR",
  "status": "READY_FOR_DISPATCH",
  "routeSummary": "Munich to Milan premium enclosed lane",
  "dispatchNotes": "Cargo space held for 48 hours"
}`;

const RENTAL_DISPATCH_BLUEPRINT = `{
  "bookingRef": "RA-88012",
  "requestMode": "rental",
  "rentalId": "bmw-r1250gs-lis-hertz-ride-lisbon",
  "estimatedPrice": 149,
  "currency": "EUR",
  "status": "READY_FOR_DISPATCH",
  "operatorDispatchRef": "HTZ-LIS-771",
  "dispatchNotes": "Verified inventory and rider intake complete"
}`;

const MODE_STYLES = {
  logistics: "border-sky-500/25 bg-sky-500/10 text-sky-300",
  rental: "border-[#A76330]/30 bg-[#A76330]/15 text-[#E2BB76]",
};

function SummaryCard({ label, value, helper }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#121212] p-4">
      <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
        {label}
      </div>
      <div className="mt-3 text-3xl font-black tabular-nums text-white">
        {value}
      </div>
      <div className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
        {helper}
      </div>
    </div>
  );
}

function ConsoleMessage({ entry }) {
  const tone =
    entry.type === "error"
      ? "border-red-500/25 bg-red-500/10 text-red-300"
      : entry.type === "success"
        ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
        : "border-white/10 bg-white/[0.03] text-zinc-300";

  const Icon =
    entry.type === "error"
      ? AlertTriangle
      : entry.type === "success"
        ? CheckCircle2
        : RadioTower;

  return (
    <div className={`rounded-2xl border px-4 py-3 ${tone}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="text-sm leading-6">{entry.message}</div>
      </div>
    </div>
  );
}

function LeadIntentBadge({ requestMode }) {
  const tone = MODE_STYLES[requestMode] || MODE_STYLES.logistics;

  return (
    <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${tone}`}>
      {requestMode}
    </span>
  );
}

export default function BookingManager() {
  const [payloadInput, setPayloadInput] = useState("");
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [validationResult, setValidationResult] = useState({
    status: "idle",
    messages: [
      {
        type: "info",
        message:
          "Paste QuoteDispatch JSON from your AI sales agent, then validate it against the live graph before dispatch.",
      },
    ],
  });

  const telemetry = useMemo(() => {
    const active = MOCK_LEADS.length;
    const logistics = MOCK_LEADS.filter(
      (lead) => lead.requestMode === "logistics" && lead.status === "PENDING_QUOTE",
    ).length;
    const rentals = MOCK_LEADS.filter(
      (lead) => lead.requestMode === "rental" && lead.status === "PENDING_QUOTE",
    ).length;
    const ready = MOCK_LEADS.filter((lead) => lead.status === "READY_FOR_DISPATCH").length;

    return { active, logistics, rentals, ready };
  }, []);

  const validatePayload = () => {
    const trimmed = payloadInput.trim();

    if (!trimmed) {
      setValidationResult({
        status: "error",
        messages: [
          {
            type: "error",
            message: "VALIDATION ABORTED: Quote payload is empty.",
          },
        ],
      });
      return;
    }

    let parsed;

    try {
      parsed = JSON.parse(trimmed);
    } catch (error) {
      setValidationResult({
        status: "error",
        messages: [
          {
            type: "error",
            message: `JSON PARSE FAILURE: ${error.message}`,
          },
        ],
      });
      return;
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      setValidationResult({
        status: "error",
        messages: [
          {
            type: "error",
            message: "QUOTE FORMAT ERROR: Payload must be a single JSON object.",
          },
        ],
      });
      return;
    }

    const requiredFields = ["bookingRef", "estimatedPrice", "currency", "status"];
    const missingFields = requiredFields.filter((field) => parsed[field] == null || parsed[field] === "");
    const messages = [];
    let hasErrors = false;

    if (missingFields.length > 0) {
      hasErrors = true;
      messages.push({
        type: "error",
        message: `SCHEMA FAILURE: Missing required field(s) ${missingFields.join(", ")}.`,
      });
    }

    const quoteMode = parsed.requestMode || parsed.intent || null;

    if (quoteMode === "rental") {
      if (!parsed.rentalId) {
        hasErrors = true;
        messages.push({
          type: "error",
          message: "SCHEMA FAILURE: Rental dispatches must include rentalId.",
        });
      } else if (!GRAPH?.rentals?.[parsed.rentalId]) {
        hasErrors = true;
        messages.push({
          type: "error",
          message:
            "ORPHAN DETECTED: The machine requested in this quote does not exist in the active graph.",
        });
      }
    }

    if (!hasErrors) {
      messages.unshift({
        type: "success",
        message: "QUOTE VERIFIED: Payload aligns with graph inventory. Ready for dispatch.",
      });
      messages.push({
        type: "info",
        message: `Validated bookingRef ${parsed.bookingRef} with ${parsed.currency} ${parsed.estimatedPrice}.`,
      });
    }

    setValidationResult({
      status: hasErrors ? "error" : "success",
      messages,
    });
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,rgba(18,18,18,0.96),rgba(10,10,10,0.92))] p-6 lg:p-8">
        <div className="max-w-3xl">
          <div className="text-[10px] uppercase tracking-[0.34em] text-[#CDA755]">
            Sales Command
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white lg:text-5xl">
            Agentic Quote Injector
          </h1>
          <p className="mt-4 text-sm leading-7 text-zinc-400 lg:text-base">
            Replace manual quoting with a validation sandbox for AI-generated logistics quotes and rental dispatch payloads before they are handed off to riders.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Active Inquiries"
          value={telemetry.active}
          helper="Live broker queue"
        />
        <SummaryCard
          label="Pending Logistics Quotes"
          value={telemetry.logistics}
          helper="Awaiting AI pricing dispatch"
        />
        <SummaryCard
          label="Pending Rental Approvals"
          value={telemetry.rentals}
          helper="Inventory-linked dispatches"
        />
        <SummaryCard
          label="Ready For Dispatch"
          value={telemetry.ready}
          helper="Validated and broker-cleared"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="rounded-[28px] border border-white/10 bg-[#121212]">
          <div className="border-b border-white/10 px-5 py-5">
            <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
              Live Pipeline
            </div>
            <h2 className="mt-2 text-xl font-semibold text-white">The Truth Layer</h2>
          </div>

          <div className="space-y-3 p-4">
            {MOCK_LEADS.map((lead) => (
              <div
                key={lead.id}
                className="rounded-2xl border border-white/10 bg-[#050505] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-white">{lead.riderName}</div>
                    <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                      {lead.bookingRef}
                    </div>
                  </div>

                  <LeadIntentBadge requestMode={lead.requestMode} />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      Airport Hub
                    </div>
                    <div className="mt-2 text-sm font-medium text-white">{lead.airportHub}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      Status
                    </div>
                    <div className="mt-2 text-sm font-medium text-white">{lead.status}</div>
                  </div>
                </div>

                <div className="mt-4 text-xs leading-6 text-zinc-400">
                  {lead.requestMode === "rental"
                    ? lead.selectedRentalMachine
                    : `${lead.pickupCity} → ${lead.destinationCity}`}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/10 bg-[#121212] p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#A76330]/30 bg-[#A76330]/10">
                <Wrench className="h-5 w-5 text-[#CDA755]" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                  Quote Injector
                </div>
                <h2 className="mt-2 text-xl font-semibold text-white">Validation Sandbox</h2>
              </div>
            </div>

            <textarea
              value={payloadInput}
              onChange={(event) => setPayloadInput(event.target.value)}
              spellCheck={false}
              placeholder="Paste raw QuoteDispatch JSON here..."
              className="mt-5 min-h-[320px] w-full rounded-3xl border border-white/10 bg-[#050505] px-4 py-4 font-mono text-sm leading-7 text-zinc-200 outline-none transition-colors placeholder:text-zinc-600 focus:border-[#A76330]/40"
            />

            <button
              type="button"
              onClick={validatePayload}
              className="mt-5 inline-flex items-center gap-3 rounded-full border border-[#A76330]/40 bg-[#A76330]/15 px-5 py-3 text-sm font-semibold text-[#E2BB76] transition-colors hover:border-[#A76330]/60 hover:bg-[#A76330]/20"
            >
              <ShieldCheck className="h-4 w-4" />
              Validate AI Quote Payload
            </button>

            <div className="mt-5 space-y-3">
              {validationResult.messages.map((entry, index) => (
                <ConsoleMessage
                  key={`${entry.type}-${index}-${entry.message}`}
                  entry={entry}
                />
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#121212] p-5">
            <button
              type="button"
              onClick={() => setShowBlueprint((current) => !current)}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#A76330]/30 bg-[#A76330]/10">
                  <Database className="h-4 w-4 text-[#CDA755]" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                    Required Quote Blueprint
                  </div>
                  <div className="mt-1 text-lg font-semibold text-white">
                    LogisticsQuote + RentalDispatch Contract
                  </div>
                </div>
              </div>

              <ChevronDown
                className={`h-5 w-5 text-zinc-500 transition-transform ${
                  showBlueprint ? "rotate-180" : ""
                }`}
              />
            </button>

            {showBlueprint ? (
              <div className="mt-5 space-y-5">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                    LogisticsQuote
                  </div>
                  <pre className="mt-3 overflow-auto rounded-3xl border border-white/10 bg-[#050505] p-4 font-mono text-xs leading-6 text-zinc-200">
                    {LOGISTICS_QUOTE_BLUEPRINT}
                  </pre>
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                    RentalDispatch
                  </div>
                  <pre className="mt-3 overflow-auto rounded-3xl border border-white/10 bg-[#050505] p-4 font-mono text-xs leading-6 text-zinc-200">
                    {RENTAL_DISPATCH_BLUEPRINT}
                  </pre>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
