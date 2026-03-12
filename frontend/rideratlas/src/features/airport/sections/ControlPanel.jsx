import React from "react";
import { motion } from "framer-motion";

function ControlPanel({ data, airportName }) {
    const getCategoryTheme = (cat) => {
      switch (cat) {
        case "Auth":
          return "border-rose-500/10 hover:border-rose-500/40 hover:bg-rose-500/5 text-rose-500/70 group-hover:text-rose-400";
        case "Transfer":
          return "border-blue-500/10 hover:border-blue-500/40 hover:bg-blue-500/5 text-blue-500/70 group-hover:text-blue-400";
        default:
          return "border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 text-zinc-500 group-hover:text-amber-500";
      }
    };
  
    return (
      <section id="control" className="py-20 bg-black/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="text-amber-500 font-mono text-[10px] font-black tracking-[0.4em] uppercase italic mb-3">
                LIVE_AIRPORT_ACCESS_PANEL
              </div>
              <h2 className="text-2xl font-black italic uppercase text-white tracking-tight">
                Airport Control Panel
              </h2>
            </div>
            <p className="text-[10px] font-mono text-zinc-600 italic uppercase tracking-widest max-w-[300px] md:text-right">
              Operational utility hub. Verify details with {airportName} authority.
            </p>
          </div>
  
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-2">
            {data.map((item, i) => (
              <a
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col items-center justify-center gap-3 p-5 rounded-xl border bg-zinc-900/20 backdrop-blur-md transition-all duration-300 text-center ${getCategoryTheme(
                  item.category
                )}`}
              >
                <item.icon
                  size={20}
                  className="transition-all duration-300 group-hover:scale-110"
                />
                <span
                  className={`text-[9px] font-mono font-black uppercase tracking-widest transition-colors ${
                    item.category === "Auth"
                      ? "text-rose-500/60 group-hover:text-white"
                      : "text-zinc-500 group-hover:text-white"
                  }`}
                >
                  {item.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    );
  }

  export default ControlPanel;
