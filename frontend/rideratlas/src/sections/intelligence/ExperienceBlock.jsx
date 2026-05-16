import React from "react";
import * as LucideIcons from "lucide-react";

/**
 * ExperienceBlock - Displays key metrics (stats) for a journey or theater.
 */
export default function ExperienceBlock({
  title,
  eyebrow,
  description,
  stats = [],
  theme = "light", // "light" | "dark"
}) {
  const isDark = theme === "dark";
  const bgColor = isDark ? "bg-[#121212]" : "bg-white";
  const borderColor = isDark ? "border-white/10" : "border-black/5";
  const textColor = isDark ? "text-white" : "text-[#1C1B18]";
  const labelColor = isDark ? "text-zinc-500" : "text-[#706F6C]";
  const iconColor = isDark ? "text-[#CDA755]" : "text-[#C9A14A]";

  if (stats.length === 0) return null;

  return (
    <section className="space-y-12">
      {(title || eyebrow || description) && (
        <div className="max-w-3xl">
          {eyebrow && (
            <div className={`font-mono text-[10px] uppercase tracking-[0.3em] font-bold mb-4 ${iconColor}`}>
              {eyebrow}
            </div>
          )}
          {title && (
            <h2 className={`text-3xl font-headline font-bold uppercase tracking-tight mb-4 ${textColor}`}>
              {title}
            </h2>
          )}
          {description && (
            <p className={`text-sm leading-relaxed ${labelColor}`}>
              {description}
            </p>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s, idx) => {
          const Icon = LucideIcons[s.icon] || LucideIcons.Activity;
          
          return (
            <div
              key={idx}
              className={`rounded-[24px] border p-6 transition-all shadow-xl group hover:border-[#CDA755]/30 ${bgColor} ${borderColor}`}
            >
              <div className={`flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] font-black ${labelColor}`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
                {s.label}
              </div>
              <div className={`mt-4 text-xl font-black tabular-nums uppercase tracking-tight ${textColor}`}>
                {s.value}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
