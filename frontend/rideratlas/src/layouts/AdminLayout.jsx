import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  Database,
  Globe2,
  LayoutDashboard,
  Plane,
  Route,
  ShieldCheck,
  Video,
  Warehouse,
} from "lucide-react";

const NAV_ITEMS = [
  {
    to: "/admin",
    label: "Command Center",
    icon: LayoutDashboard,
  },
  {
    to: "/admin/rentals",
    label: "Fleet & Operators",
    icon: Database,
  },
  {
    to: "/admin/media",
    label: "Media Dashboard",
    icon: Video,
  },
  {
    to: "/admin/routes",
    label: "Riding Theaters & Routes",
    icon: Route,
  },
  {
    to: "/admin/airports",
    label: "Logistics Hubs",
    icon: Plane,
  },
  {
    to: "/admin/pools",
    label: "Transport Pools",
    icon: Warehouse,
  },
];

function AdminNavLink({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      end={to === "/admin"}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors",
          isActive
            ? "border-[#CDA755]/40 bg-[#A76330]/15 text-white"
            : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-[#A76330]/40 hover:text-white",
        ].join(" ")
      }
    >
      <Icon className="h-4 w-4 text-[#CDA755]" />
      <span className="text-sm font-medium tracking-wide">{label}</span>
    </NavLink>
  );
}

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-[#121212] px-5 py-6 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#A76330]/40 bg-[#A76330]/10">
              <Globe2 className="h-5 w-5 text-[#CDA755]" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                Flight Crew CRM
              </div>
              <div className="mt-1 text-sm font-semibold tracking-[0.16em] text-white">
                Operational Deck
              </div>
            </div>
          </div>

          <nav className="mt-6 space-y-3">
            {NAV_ITEMS.map((item) => (
              <AdminNavLink key={item.to} {...item} />
            ))}
          </nav>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-[#CDA755]">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em]">
                Flight Crew Active
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Visualize the live graph, validate references, and stage agent-driven content expansion.
            </p>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050505]/95 backdrop-blur-xl">
            <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
              <div>
                <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500">
                  Command Status
                </div>
                <div className="mt-1 text-lg font-semibold tracking-[0.14em] text-white">
                  Flight Crew Active
                </div>
              </div>

              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#121212] px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-[#A76330]/40 hover:text-white"
              >
                <Globe2 className="h-4 w-4 text-[#CDA755]" />
                Return to Platform
              </Link>
            </div>
          </header>

          <main className="px-8 pt-6 pb-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
