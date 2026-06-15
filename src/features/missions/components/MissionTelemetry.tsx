interface Props {
  mission: any;
}

export default function MissionTelemetry({ mission }: Props) {
  const telemetry = [
    { label: "Range", value: `${mission.distance_km} KM`, sub: "Total Distance" },
    { label: "Duration", value: `${mission.duration_days} Days`, sub: "Mission Length" },
    { label: "Vertical", value: `${mission.elevation_gain_m} M`, sub: "Elevation Gain" },
    { label: "Tactical", value: mission.riding_style, sub: "Riding Character" }
  ];

  return (
    <section className="py-12 bg-[#CDA755]">
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {telemetry.map((item, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-[#0B0B0C]/40 text-[10px] font-black uppercase tracking-[0.3em] mb-1">
                {item.label}
              </span>
              <span className="text-[#0B0B0C] text-4xl font-bold tracking-tighter">
                {item.value}
              </span>
              <span className="text-[#0B0B0C]/60 text-[10px] font-bold uppercase tracking-widest mt-1">
                {item.sub}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
