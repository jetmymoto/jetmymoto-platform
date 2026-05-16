import React from "react";

export default function AirportJourneyBridge({ city, copy }) {
  const statusItems = copy?.statusItems || [
    { label: "Riding Season", value: "PRIME CONDITIONS", accent: true },
    { label: "Local Forecast", value: "22°C / CLEAR SKY", accent: false },
    { label: "Route Advice", value: "NORTHERN PASSES OPEN", italic: true },
    { label: "Fleet Availability", value: "96% READY", accent: false },
  ];

  return (
    <div className="bg-white border-y border-black/5 py-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
      <div className="flex gap-16 px-12 items-center min-w-max justify-center">
        {statusItems.map((item, i) => (
          <React.Fragment key={i}>
            <div className="flex items-center gap-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#706F6C] font-medium">
                {item.label}
              </div>
              <div className={`font-mono text-sm font-bold ${item.accent ? 'text-[#C9A14A]' : 'text-[#1C1B18]'} ${item.italic ? 'italic' : ''}`}>
                {item.value}
              </div>
            </div>
            {i < statusItems.length - 1 && (
              <div className="h-6 w-[1px] bg-black/10"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}