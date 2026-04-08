import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Database,
  LoaderCircle,
  RadioTower,
  ShieldCheck,
  Sparkles,
  Video,
  Wrench,
} from "lucide-react";

import { GRAPH } from "@/core/network/networkGraph";
import { CINEMATIC_NEGATIVE_PROMPT, CINEMATIC_POSITIVE_PROMPT_TEMPLATE } from "../../../../../shared/mediaPromptConstants.js";

const OPERATOR_SCHEMA = `[
  {
    "id": "hertz-ride-athens",
    "slug": "hertz-ride-athens",
    "name": "Hertz Ride Athens",
    "type": "global",
    "country": "GR",
    "airports": ["ATH"],
    "website_url": "https://www.hertzride.com/en/locations",
    "status": "seeded",
    "pricing_model": "affiliate",
    "commission_type": "percentage",
    "commission_value": 15
  }
]`;

const RENTAL_SCHEMA = `[
  {
    "id": "bmw-r1300gs-ath-hertz-ride-athens",
    "slug": "bmw-r1300gs-ath-hertz-ride-athens",
    "airport": "ATH",
    "operator": "hertz-ride-athens",
    "brand": "BMW",
    "model": "R 1300 GS",
    "bike_name": "BMW R 1300 GS",
    "category": "adventure",
    "price_day": 179,
    "currency": "EUR",
    "compatible_destinations": ["peloponnese", "meteora", "crete-ferry"],
    "booking_mode": "request",
    "availability_status": "available",
    "insurance_included": true
  }
]`;

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

function TabButton({ active, onClick, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-[#A76330]/40 bg-[#A76330]/15 text-white"
          : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-[#A76330]/30 hover:text-white",
      ].join(" ")}
    >
      <span>{label}</span>
      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] tabular-nums text-zinc-400">
        {count}
      </span>
    </button>
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

function hasValidVideoAsset(rental) {
  const candidateUrls = [
    rental?.videoUrl,
    rental?.video_url,
    rental?.media?.video,
  ];

  return candidateUrls.some(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
}

function humanizeDestinationSlug(destination) {
  if (typeof destination !== "string" || !destination.trim()) {
    return "";
  }

  return destination
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatPromptDestinations(destinations) {
  if (!Array.isArray(destinations) || destinations.length === 0) {
    return "a scenic mountain pass";
  }

  const cleaned = destinations
    .map((destination) => humanizeDestinationSlug(destination))
    .filter(Boolean);

  if (cleaned.length === 0) {
    return "a scenic mountain pass";
  }

  if (cleaned.length === 1) {
    return cleaned[0];
  }

  if (cleaned.length === 2) {
    return `${cleaned[0]} and ${cleaned[1]}`;
  }

  return `${cleaned.slice(0, -1).join(", ")}, and ${cleaned[cleaned.length - 1]}`;
}

function synthesizePrompt(rental) {
  const brand = rental?.brand || "motorcycle";
  const model = rental?.model || "fleet machine";
  const destinationBackdrop = formatPromptDestinations(
    rental?.compatibleDestinations || rental?.compatible_destinations,
  );

  return CINEMATIC_POSITIVE_PROMPT_TEMPLATE
    .replace("{brand}", brand)
    .replace("{model}", model)
    .replace("{destination_backdrop}", destinationBackdrop);
}

export default function AdminRentalManager() {
  const [activeTab, setActiveTab] = useState("operators");
  const [payloadInput, setPayloadInput] = useState("");
  const [isDispatchingMedia, setIsDispatchingMedia] = useState(false);
  const [validationResult, setValidationResult] = useState({
    status: "idle",
    messages: [
      {
        type: "info",
        message:
          "Paste raw JSON arrays of operators or rentals generated by your research agent, then validate against the live graph.",
      },
    ],
  });
  const [showBlueprint, setShowBlueprint] = useState(false);

  const operators = useMemo(
    () => Object.values(GRAPH?.operators || {}).sort((a, b) => a.id.localeCompare(b.id)),
    [],
  );
  const rentals = useMemo(
    () => Object.values(GRAPH?.rentals || {}).sort((a, b) => a.id.localeCompare(b.id)),
    [],
  );
  const missingMediaRentals = useMemo(
    () => rentals.filter((rental) => !hasValidVideoAsset(rental)),
    [rentals],
  );

  const listItems = activeTab === "operators" ? operators : rentals;

  const pushConsoleMessage = (entry, status = "idle") => {
    setValidationResult((current) => ({
      status,
      messages: [entry, ...current.messages].slice(0, 8),
    }));
  };

  const validatePayload = () => {
    const trimmed = payloadInput.trim();

    if (!trimmed) {
      setValidationResult({
        status: "error",
        messages: [
          {
            type: "error",
            message: "VALIDATION ABORTED: Payload input is empty.",
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

    if (!Array.isArray(parsed)) {
      setValidationResult({
        status: "error",
        messages: [
          {
            type: "error",
            message: "PAYLOAD FORMAT ERROR: Root payload must be a JSON array.",
          },
        ],
      });
      return;
    }

    const messages = [];
    const graphOperatorIds = new Set(Object.keys(GRAPH?.operators || {}));
    const payloadOperatorIds = new Set(
      parsed
        .filter((item) => item && typeof item === "object" && typeof item.id === "string")
        .filter((item) => Array.isArray(item.airports) || typeof item.website_url === "string")
        .map((item) => item.id),
    );

    let rentalCount = 0;
    let operatorCount = 0;
    let hasErrors = false;

    parsed.forEach((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        hasErrors = true;
        messages.push({
          type: "error",
          message: `ENTRY ${index} INVALID: Each payload row must be an object.`,
        });
        return;
      }

      const looksLikeRental =
        typeof item.operator === "string" &&
        typeof item.airport === "string" &&
        typeof item.category === "string";
      const looksLikeOperator =
        Array.isArray(item.airports) ||
        typeof item.website_url === "string" ||
        (typeof item.country === "string" && typeof item.name === "string" && !looksLikeRental);

      if (looksLikeOperator) {
        operatorCount += 1;
      }

      if (looksLikeRental) {
        rentalCount += 1;
        const operatorExists =
          graphOperatorIds.has(item.operator) || payloadOperatorIds.has(item.operator);

        if (!operatorExists) {
          hasErrors = true;
          messages.push({
            type: "error",
            message: `ORPHAN DETECTED: Operator '${item.operator}' does not exist in the graph.`,
          });
        }
      }
    });

    if (!hasErrors) {
      messages.unshift({
        type: "success",
        message:
          "PAYLOAD VERIFIED: Relational integrity intact. Ready for codebase injection.",
      });
      messages.push({
        type: "info",
        message: `VALIDATED ${operatorCount} operators and ${rentalCount} rentals against the live graph.`,
      });
    }

    if (messages.length === 0) {
      messages.push({
        type: "info",
        message:
          "No rental relationships detected in this payload. Verify your agent returned the expected entity schema.",
      });
    }

    setValidationResult({
      status: hasErrors ? "error" : "success",
      messages,
    });
  };

  const dispatchFleetMedia = async () => {
    if (missingMediaRentals.length === 0 || isDispatchingMedia) {
      return;
    }

    setIsDispatchingMedia(true);

    try {
      const payload = missingMediaRentals.map((rental) => ({
        rental_id: rental.id,
        ai_video_prompt: synthesizePrompt(rental),
      }));

      const n8nWebhookUrl =
        import.meta.env.VITE_N8N_MEDIA_WEBHOOK_URL ||
        "http://localhost:5678/webhook/fleet-media";
      const n8nSecret = import.meta.env.VITE_N8N_SECRET || "local-test-secret";

      const response = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + n8nSecret,
        },
        body: JSON.stringify({ payload }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `n8n webhook dispatch failed (${response.status}): ${errorText}`,
        );
      }

      pushConsoleMessage(
        {
          type: "success",
          message: `MEDIA AGENTS DISPATCHED: n8n workflow triggered for ${payload.length} assets.`,
        },
        "success",
      );
    } catch (error) {
      const message =
        error?.message ||
        "Callable dispatch failed before the media queue accepted the batch.";

      pushConsoleMessage(
        {
          type: "error",
          message: `MEDIA ENGINE CRITICAL: ${message}`,
        },
        "error",
      );
    } finally {
      setIsDispatchingMedia(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,rgba(18,18,18,0.96),rgba(10,10,10,0.9))] p-6 lg:p-8">
        <div className="max-w-3xl">
          <div className="text-[10px] uppercase tracking-[0.34em] text-[#CDA755]">
            Agentic Content Workflow
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white lg:text-5xl">
            Fleet & Operators Validation Sandbox
          </h1>
          <p className="mt-4 text-sm leading-7 text-zinc-400 lg:text-base">
            Compare AI-generated fleet payloads against the live graph, catch orphaned operator references, and confirm relational integrity before a coding agent injects anything into the codebase.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          label="Active Operators"
          value={operators.length}
          helper="Live graph operator keys"
        />
        <SummaryCard
          label="Indexed Rentals"
          value={rentals.length}
          helper="Verified machine records"
        />
        <SummaryCard
          label="Missing Media Assets"
          value={missingMediaRentals.length}
          helper="Machines with no videoUrl"
        />
        <SummaryCard
          label="Current Tab Rows"
          value={listItems.length}
          helper={activeTab === "operators" ? "Operator roster" : "Rental roster"}
        />
        <SummaryCard
          label="Validation Status"
          value={validationResult.status === "success" ? "OK" : validationResult.status === "error" ? "ERR" : "IDLE"}
          helper="Payload console state"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="rounded-[28px] border border-white/10 bg-[#121212]">
          <div className="border-b border-white/10 px-5 py-5">
            <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
              Live Graph State
            </div>
            <h2 className="mt-2 text-xl font-semibold text-white">The Truth Layer</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <TabButton
                active={activeTab === "operators"}
                onClick={() => setActiveTab("operators")}
                label="Active Operators"
                count={operators.length}
              />
              <TabButton
                active={activeTab === "rentals"}
                onClick={() => setActiveTab("rentals")}
                label="Indexed Rentals"
                count={rentals.length}
              />
            </div>
          </div>

          <div className="max-h-[760px] overflow-auto p-4">
            <div className="space-y-3">
              {activeTab === "operators" &&
                operators.map((operator) => (
                  <div
                    key={operator.id}
                    className="rounded-2xl border border-white/10 bg-[#050505] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-white">{operator.name}</div>
                        <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                          {operator.id}
                        </div>
                      </div>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                        {operator.type}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(operator.airports || []).map((airportCode) => (
                        <span
                          key={airportCode}
                          className="rounded-full border border-[#A76330]/30 bg-[#A76330]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E2BB76]"
                        >
                          {airportCode}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

              {activeTab === "rentals" &&
                rentals.map((rental) => (
                  <div
                    key={rental.id}
                    className="rounded-2xl border border-white/10 bg-[#050505] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {rental.brand} {rental.model}
                        </div>
                        <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                          {rental.id}
                        </div>
                      </div>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                        {rental.category}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.18em] text-zinc-500">
                      <span>{rental.airport}</span>
                      <span className="tabular-nums">
                        {rental.currency} {Number(rental.price_day || rental.price || 0)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
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
                  Payload Injector
                </div>
                <h2 className="mt-2 text-xl font-semibold text-white">Validation Sandbox</h2>
              </div>
            </div>

            <textarea
              value={payloadInput}
              onChange={(event) => setPayloadInput(event.target.value)}
              spellCheck={false}
              placeholder="Paste raw JSON arrays of new operators or rentals here..."
              className="mt-5 min-h-[320px] w-full rounded-3xl border border-white/10 bg-[#050505] px-4 py-4 font-mono text-sm leading-7 text-zinc-200 outline-none transition-colors placeholder:text-zinc-600 focus:border-[#A76330]/40"
            />

            <button
              type="button"
              onClick={validatePayload}
              className="mt-5 inline-flex items-center gap-3 rounded-full border border-[#A76330]/40 bg-[#A76330]/15 px-5 py-3 text-sm font-semibold text-[#E2BB76] transition-colors hover:border-[#A76330]/60 hover:bg-[#A76330]/20"
            >
              <ShieldCheck className="h-4 w-4" />
              Validate AI Payload
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
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#A76330]/30 bg-[#A76330]/10">
                  <Video className="h-5 w-5 text-[#CDA755]" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                    Fleet Media Engine
                  </div>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    Agentic Media Production
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                    Detect machines with no cinematic video asset, synthesize
                    luxury-tactical prompts from live graph data, and dispatch
                    the batch into the asynchronous webhook pipeline.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#A76330]/25 bg-[#050505] px-4 py-3 text-right">
                <div className="text-[10px] uppercase tracking-[0.26em] text-zinc-500">
                  Machines Requiring Video
                </div>
                <div className="mt-2 text-3xl font-black tabular-nums text-white">
                  {missingMediaRentals.length}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-white/10 bg-[#050505] p-4">
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-[#CDA755]">
                <Sparkles className="h-4 w-4" />
                Automated Prompt Synthesizer
              </div>
              <div className="mt-4 text-sm leading-7 text-zinc-300">
                {missingMediaRentals.length > 0 ? (
                  <div className="space-y-3">
                    <div>{synthesizePrompt(missingMediaRentals[0])}</div>
                    <div className="rounded-2xl border border-[#A76330]/20 bg-[#121212] px-3 py-3 font-mono text-xs leading-6 text-zinc-400">
                      Negative prompt: {CINEMATIC_NEGATIVE_PROMPT}
                    </div>
                  </div>
                ) : (
                  <span>
                    All indexed machines already have video assets attached.
                    No dispatch payload is currently required.
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {missingMediaRentals.slice(0, 4).map((rental) => (
                <div
                  key={rental.id}
                  className="rounded-2xl border border-white/10 bg-[#050505] px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {rental.brand} {rental.model}
                      </div>
                      <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                        {rental.id}
                      </div>
                    </div>
                    <span className="rounded-full border border-[#A76330]/30 bg-[#A76330]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E2BB76]">
                      awaiting video
                    </span>
                  </div>
                  <div className="mt-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
                    {formatPromptDestinations(rental.compatibleDestinations || rental.compatible_destinations)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                {missingMediaRentals.length > 4 ?
                  `+${missingMediaRentals.length - 4} more machines staged for dispatch` :
                  "Webhook receiver will reconcile final MP4 URLs asynchronously"}
              </div>

              <button
                type="button"
                onClick={dispatchFleetMedia}
                disabled={missingMediaRentals.length === 0 || isDispatchingMedia}
                className={[
                  "inline-flex items-center gap-3 rounded-full border px-5 py-3 text-sm font-semibold transition-colors",
                  missingMediaRentals.length === 0 || isDispatchingMedia ?
                    "cursor-not-allowed border-white/10 bg-white/[0.03] text-zinc-500" :
                    "border-[#A76330]/40 bg-[#A76330]/15 text-[#E2BB76] hover:border-[#A76330]/60 hover:bg-[#A76330]/20",
                ].join(" ")}
              >
                {isDispatchingMedia ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Video className="h-4 w-4" />
                )}
                {isDispatchingMedia ?
                  "Dispatching Video Agents..." :
                  `Dispatch Video AI For ${missingMediaRentals.length} Machines`}
              </button>
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
                    Required Schema Blueprint
                  </div>
                  <div className="mt-1 text-lg font-semibold text-white">
                    Operator + Rental Payload Contract
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
                    Operator Entity
                  </div>
                  <pre className="mt-3 overflow-auto rounded-3xl border border-white/10 bg-[#050505] p-4 font-mono text-xs leading-6 text-zinc-200">
                    {OPERATOR_SCHEMA}
                  </pre>
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                    Rental Entity
                  </div>
                  <pre className="mt-3 overflow-auto rounded-3xl border border-white/10 bg-[#050505] p-4 font-mono text-xs leading-6 text-zinc-200">
                    {RENTAL_SCHEMA}
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
