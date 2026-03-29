import React from 'react';
import TheAviationHero from '@/components/TheAviationHero';
import TheTelemetryLedger from '@/components/TheTelemetryLedger';

const TactileHardwarePrototypePage = () => {
  return (
    <main className="min-h-screen bg-[#050505] text-[#F8F8F8]">
      <TheAviationHero />
      <div className="border-t border-white/[0.06] bg-[linear-gradient(180deg,#080808_0%,#050505_100%)] py-12">
        <TheTelemetryLedger />
      </div>
    </main>
  );
};

export default TactileHardwarePrototypePage;