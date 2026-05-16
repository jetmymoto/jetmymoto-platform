const fs = require('fs');
const file = 'frontend/rideratlas/src/components/RouteDiscoverySection.jsx';
let content = fs.readFileSync(file, 'utf8');

const featuredRegex = /function FeaturedMissionCard\(\{\s*mission,\s*index,\s*isHighlighted\s*\}\) \{[\s\S]*?(?=function FeaturedMissions)/;
const simplifiedRegex = /function SimplifiedMissionCard\(\{\s*mission,\s*index,\s*shardState,\s*rentalShard,\s*onMissionHover\s*\}\) \{[\s\S]*?(?=function MissionCard)/;

const newFeatured = `function FeaturedMissionCard({ mission, index, isHighlighted }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const isA2A = mission.isA2A ?? false;
  const countriesLabel = (mission.countries ?? []).join(" → ");
  const ctaHref = mission.graphDest
    ? \`/destination/\${encodeURIComponent(mission.graphDest)}\`
    : "/routes";

  // Calculate urgency indicators for A2A missions
  const pricePerDay = isA2A && mission.finalPrice
    ? Math.floor(mission.finalPrice / parseDurationDays(mission.duration))
    : 0;

  return (
    <motion.div
      {...cardReveal(index)}
      viewport={{ once: true }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={\`group relative flex flex-col justify-end overflow-hidden rounded-2xl cursor-pointer \${
        isHighlighted
          ? "h-[420px] bg-[#1a1a1a] border border-[#CDA755]/30 shadow-[0_0_40px_rgba(205,167,85,0.1)]"
          : "h-[380px] bg-[#111] border border-white/5"
      }\`}
    >
      {/* Background image */}
      <div className="absolute inset-0 overflow-hidden">
        {mission.image ? (
          <>
            <div
              className={\`absolute inset-0 bg-cover bg-center transition-all duration-[1200ms] ease-out \${
                isHighlighted ? "brightness-90" : "brightness-75"
              } group-hover:brightness-100 \${
                imgLoaded ? "opacity-100" : "opacity-0"
              } group-hover:scale-[1.02]\`}
              style={{ backgroundImage: \`url(\${mission.image})\` }}
            />
            <img
              src={mission.image}
              alt=""
              className="sr-only"
              onLoad={() => setImgLoaded(true)}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
        )}
      </div>

      {/* Controlled vertical gradient for guaranteed legibility */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.45)_40%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

      {/* DESIRE-DRIVEN Content */}
      <Link to={ctaHref} className="relative z-10 p-6 flex flex-col group/card h-full justify-end text-left">
        {/* 1. Experience Hook */}
        <div className="mb-2">
          <p className="text-white/70 text-[10px] font-mono uppercase tracking-[0.2em] mb-1.5">
            {countriesLabel}
          </p>
          {mission.featuredBike && (
            <p className="text-white text-base font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
              Ride {mission.featuredBike} across {mission.title}
            </p>
          )}
        </div>

        {/* 2. The "Hook" Moment */}
        {isA2A && pricePerDay > 0 ? (
          <div>
            <div className="text-white font-black text-3xl leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
              €{pricePerDay}<span className="text-lg text-white/70 font-semibold ml-1">/day</span>
            </div>
            <div className="text-white/60 text-sm mt-1">
              {mission.duration} • {mission.featuredBike || 'Premium machine'}
            </div>
            {mission.savings && (
              <div className="text-white/50 text-xs mt-1">
                (Save €{mission.savings.toLocaleString()})
              </div>
            )}
          </div>
        ) : (
          <h3 className="font-serif text-white text-2xl leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            {mission.title}
          </h3>
        )}

        {/* 4. Desire-focused CTA */}
        <button className="w-full bg-[#CDA755] text-black py-3 px-6 font-black text-sm uppercase tracking-[0.2em] hover:bg-[#F3E5C7] transition-colors duration-300 mt-5 mb-3">
          Begin This Ride
        </button>

        {/* 5. Quiet Scarcity */}
        {isA2A && (
          <div className="text-left text-white/40 text-[10px] font-mono uppercase tracking-widest">
            Allocated inventory
          </div>
        )}
      </Link>
    </motion.div>
  );
}
`;

const newSimplified = `function SimplifiedMissionCard({ mission, index, shardState, rentalShard, onMissionHover }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [motorcycleImgLoaded, setMotorcycleImgLoaded] = useState(false);

  const isA2A = mission.isA2A ?? false;
  const countriesLabel = (mission.countries ?? []).join(" → ");
  const ctaHref = mission.graphDest
    ? \`/destination/\${encodeURIComponent(mission.graphDest)}\`
    : "/routes";

  // Get cinematic motorcycle image for this mission
  const motorcycleImage = getMotorcycleImageForMission(mission);
  const displayImage = motorcycleImage?.url || mission.image;

  const handleMouseEnter = () => {
    onMissionHover?.({
      image: displayImage,
      title: mission.title,
      subtitle: countriesLabel,
      subsidyPct: mission.subsidyPct ?? null,
      finalPrice: mission.finalPrice ?? null,
      savings: mission.savings ?? null,
      motorcycleBrand: motorcycleImage?.brand,
      motorcycleModel: motorcycleImage?.model,
    });
  };

  return (
    <motion.div
      {...cardReveal(index)}
      viewport={{ once: true }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      onMouseEnter={handleMouseEnter}
      className="group relative flex flex-col justify-end overflow-hidden rounded-2xl bg-[#111] h-[340px] cursor-pointer border border-white/5"
    >
      {/* Cinematic motorcycle background */}
      <div className="absolute inset-0 overflow-hidden">
        {displayImage ? (
          <>
            <div
              className={\`absolute inset-0 bg-cover bg-center transition-all duration-[1200ms] ease-out \${
                motorcycleImgLoaded ? "opacity-100" : "opacity-0"
              } group-hover:scale-[1.02] transform-gpu\`}
              style={{
                backgroundImage: \`url(\${displayImage})\`,
              }}
            />

            <img
              src={displayImage}
              alt={motorcycleImage ? \`\${motorcycleImage.brand} \${motorcycleImage.model}\` : ""}
              className="sr-only"
              onLoad={() => {
                setMotorcycleImgLoaded(true);
                setImgLoaded(true);
              }}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
        )}
      </div>

      {/* Controlled vertical gradient for guaranteed legibility */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.45)_40%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

      {/* Motorcycle brand badge */}
      {motorcycleImage && (
        <div className="absolute top-5 left-5 z-20 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded border border-white/10 text-left">
          <div className="text-white/70 text-[8px] font-mono uppercase tracking-[0.2em] leading-none">
            {motorcycleImage.brand}
          </div>
          <div className="text-white text-[10px] font-semibold leading-none mt-1">
            {motorcycleImage.model}
          </div>
        </div>
      )}

      {/* Desire-Driven Simplified Content */}
      <Link to={ctaHref} className="relative z-10 p-6 flex flex-col group/card h-full justify-end text-left">
        {/* 1. Experience Hook */}
        <div className="mb-2">
          <p className="text-white/70 text-[10px] font-mono uppercase tracking-[0.2em] mb-1.5">
            {countriesLabel}
          </p>
          {motorcycleImage && (
            <p className="text-white text-sm font-semibold transition-colors duration-500 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
              Ride {motorcycleImage.brand} {motorcycleImage.model}
            </p>
          )}
        </div>

        {/* 2. The Hook Moment */}
        {isA2A && mission.finalPrice ? (
          <div>
            <div className="text-white font-black text-2xl leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
              €{Math.floor(mission.finalPrice / parseDurationDays(mission.duration))}<span className="text-base text-white/70 font-semibold ml-1">/day</span>
            </div>
            <div className="text-white/60 text-xs mt-1">
              {mission.duration} • {motorcycleImage ? \`\${motorcycleImage.brand} \${motorcycleImage.model}\` : 'Premium machine'}
            </div>
            {mission.savings && (
              <div className="text-white/50 text-xs mt-1">
                (Save €{mission.savings.toLocaleString()})
              </div>
            )}
          </div>
        ) : (
          <h3 className="font-serif text-white text-xl leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            {mission.title}
          </h3>
        )}

        {/* 4. Desire CTA */}
        <button className="w-full bg-[#CDA755] text-black py-2.5 px-6 font-black text-sm uppercase tracking-[0.2em] hover:bg-[#F3E5C7] transition-colors duration-300 mt-5 mb-3">
          Begin This Ride
        </button>

        {/* 5. Quiet Scarcity */}
        {isA2A && (
          <div className="text-left text-white/40 text-[10px] font-mono uppercase tracking-widest">
            Allocated inventory
          </div>
        )}
      </Link>
    </motion.div>
  );
}
`;

content = content.replace(featuredRegex, newFeatured);
content = content.replace(simplifiedRegex, newSimplified);

fs.writeFileSync(file, content, 'utf8');
