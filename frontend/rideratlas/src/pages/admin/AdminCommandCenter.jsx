import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  Compass,
  Database,
  Home,
  Map,
  Plane,
  Route,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { GRAPH } from "@/core/network/networkGraph";

const METRICS = [
  {
    label: "Active Logistics Hubs",
    key: "airports",
    icon: Plane,
  },
  {
    label: "Deployed Routes",
    key: "routes",
    icon: Route,
  },
  {
    label: "Indexed Rental Machines",
    key: "rentals",
    icon: Database,
  },
  {
    label: "Verified Fleet Operators",
    key: "operators",
    icon: ShieldCheck,
  },
];

const QUICK_LINK_COLUMNS = [
  {
    title: "Core Admin & CRM",
    icon: Database,
    links: [
      { label: "Flight Crew Command Center", to: "/admin" },
      { label: "Booking & Sales Management", to: "/admin/bookings" },
      { label: "Fleet & Operators", to: "/admin/rentals" },
      { label: "Riding Theaters & Routes", to: "/admin/routes" },
      { label: "Logistics Hubs", to: "/admin/airports" },
      { label: "Transport Pools", to: "/admin/pools" },
    ],
  },
  {
    title: "JetMyMoto Ops",
    icon: Truck,
    links: [
      { label: "JetMyMoto Homepage", to: "/jetmymoto" },
      { label: "Logistics Intake (Jet Context)", to: "/moto-airlift?ctx=jet" },
      {
        label: "Rental-Intent Booking Handoff",
        to: "/moto-airlift?intent=rent&ctx=ra#booking",
      },
      { label: "Transport Pool Briefing", disabled: true, hint: "/pool/:poolId" },
      { label: "Mission Planner", disabled: true, hint: "/deploy/:missionId" },
    ],
  },
  {
    title: "RiderAtlas Ops",
    icon: Compass,
    links: [
      { label: "RiderAtlas Homepage", to: "/" },
      { label: "Global Hub Map", to: "/airport" },
      { label: "Rental Showroom (Milan/MXP)", to: "/airport/mxp?mode=rent&ctx=ra" },
      {
        label: "Rental Showroom (Los Angeles/LAX)",
        to: "/airport/lax?mode=rent&ctx=ra",
      },
    ],
  },
];

function MetricCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#121212] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
          {label}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#A76330]/30 bg-[#A76330]/10">
          <Icon className="h-4 w-4 text-[#CDA755]" />
        </div>
      </div>

      <div className="mt-6 text-4xl font-black tabular-nums text-white">
        {value}
      </div>
    </div>
  );
}

function QuickLinkButton({ label, to, disabled = false, hint }) {
  if (disabled) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left opacity-60">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-zinc-300">{label}</span>
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.24em] text-zinc-500">
            Param
          </span>
        </div>
        {hint ? (
          <div className="mt-2 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
            {hint}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <Link
      to={to}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors hover:border-[#A76330]/40 hover:bg-[#A76330]/10"
    >
      <span className="text-sm font-medium text-zinc-100">{label}</span>
      <ArrowUpRight className="h-4 w-4 text-[#CDA755] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}

function QuickLinksColumn({ title, icon: Icon, links }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#121212] p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#A76330]/30 bg-[#A76330]/10">
          <Icon className="h-4 w-4 text-[#CDA755]" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Tactical Group
          </div>
          <h3 className="mt-1 text-lg font-semibold text-white">{title}</h3>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {links.map((link) => (
          <QuickLinkButton key={link.label} {...link} />
        ))}
      </div>
    </div>
  );
}

export default function AdminCommandCenter() {
  const metrics = useMemo(
    () =>
      METRICS.map(({ key, ...metric }) => ({
        ...metric,
        value: Object.keys(GRAPH?.[key] || {}).length,
      })),
    [],
  );

  const integrity = useMemo(() => {
    const orphans = Object.values(GRAPH?.rentals || {}).filter(
      (machine) => machine?.operator && !GRAPH?.operators?.[machine.operator],
    );

    return {
      healthy: orphans.length === 0,
      orphanCount: orphans.length,
    };
  }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,rgba(18,18,18,0.96),rgba(10,10,10,0.9))] p-6 lg:p-8">
        <div className="max-w-3xl">
          <div className="text-[10px] uppercase tracking-[0.34em] text-[#CDA755]">
            Operational Dashboard
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white lg:text-5xl">
            Flight Crew Command Center
          </h1>
          <p className="mt-4 text-sm leading-7 text-zinc-400 lg:text-base">
            Monitor live graph volume, validate cross-entity references, and stage agent-built content expansion without dropping into manual CMS workflows.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="space-y-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Tactical Navigation
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Tactical Operations Launchpad
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            One-click launch points into admin command surfaces, JetMyMoto logistics flows, and RiderAtlas discovery routes with all required URL context preserved inside the SPA.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {QUICK_LINK_COLUMNS.map((column) => (
            <QuickLinksColumn key={column.title} {...column} />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#121212] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500">
              System Health
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Architecture Status
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Rental records are validated in real time against the operator graph to catch orphaned references before agent-generated seed data lands in production.
            </p>
          </div>

          <div
            className={[
              "inline-flex items-center gap-3 rounded-full border px-4 py-3 text-sm font-semibold",
              integrity.healthy
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/30 bg-red-500/10 text-red-300",
            ].join(" ")}
          >
            {integrity.healthy ? (
              <ShieldCheck className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            <span className="tabular-nums">
              {integrity.healthy
                ? "All Network References Valid"
                : `${integrity.orphanCount} Orphaned Rental References`}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
