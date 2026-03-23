import React from "react";
import { Database } from "lucide-react";

export default function AdminSectionPlaceholder({ title, description }) {
  return (
    <div className="rounded-[32px] border border-white/10 bg-[#121212] p-6 lg:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#A76330]/30 bg-[#A76330]/10">
          <Database className="h-5 w-5 text-[#CDA755]" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500">
            Agentic Content Handler
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
