const fs = require('fs');
const file = 'frontend/rideratlas/src/components/RouteDiscoverySection.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the old EntryDecisionHeader component
const edhRegex = /\/\/ ── Entry Decision Header ──[^\n]*\n[\s\S]*?(?=\/\/ ── Filter Chip ──)/;
content = content.replace(edhRegex, '');

// 2. Remove the invocation of EntryDecisionHeader
const invokeRegex = /\{\/\* ── Entry Decision Header ── \*\/}\s*<EntryDecisionHeader[^>]+>/;
content = content.replace(invokeRegex, '');

// 3. Replace the FeaturedMissions header
const fmHeaderRegex = /<div className="flex items-center justify-between mb-8">[\s\S]*?\{\/\* Slider Controls \*\/}\s*\{featuredMissions\.length > 3 && \(/;

const newFmHeader = `<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex flex-col text-left max-w-2xl">
          {/* Micro Trust / Value Line */}
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CDA755] opacity-50" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#CDA755]" />
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#CDA755]/80">
              Up to 45% below standard rental rates
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-4xl font-serif tracking-tight text-white mb-2">
            Rebalancing Missions
          </h2>

          {/* Subline */}
          <p className="text-white/60 text-sm md:text-base leading-relaxed">
            These routes exist to move fleet between cities. You ride premium machines across Europe at reduced one-way rates.
          </p>
        </div>

        {/* Slider Controls */}
        {featuredMissions.length > 3 && (`;

content = content.replace(fmHeaderRegex, newFmHeader);

fs.writeFileSync(file, content, 'utf8');
