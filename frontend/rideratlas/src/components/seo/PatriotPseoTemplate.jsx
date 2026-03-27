import React from 'react';
import TrustInfrastructure from '../home/TrustInfrastructure';

/**
 * Patriot pSEO Hub Template (Tactical Briefing Scroll)
 * Dynamically injected landing page for Airport + Motorcycle + Route combinations.
 *
 * Expected props:
 * - hero_image_url: string (URL to the cinematic hero image)
 * - bike_name: string (e.g., "BMW R 1300 GS")
 * - airport_city: string (e.g., "Milan")
 * - airport_code: string (e.g., "MXP")
 * - route_name: string (e.g., "the Dolomites")
 * - price_day: number/string (e.g., "145")
 * - currency: string (e.g., "€")
 * - suitability_score: number/string (e.g., "9.8")
 * - mission_fit_review: string (Detailed technical breakdown)
 * - operator_name: string (e.g., "EuroMotor")
 * - local_temp: string (e.g., "14°C")
 * - local_altitude: string (e.g., "2,450m")
 * - available_fleet_count: string (e.g., "04")
 */
const PatriotPseoTemplate = ({
  hero_image_url = "https://lh3.googleusercontent.com/aida-public/AB6AXuAVuD9q0RX501cqUVp9E4EsbNlAy2Fc4gLc74zyfFTecVShcvIUaxVt3EPEyvVyHB4OodRG_gsZ_bGDtSnLdpQitpNrMqaUnPjhff-fnpYkWPQdBG4491lya46TGmDaguTrIbnk1MEeTYBxcn3X2LGICxkXzFdqtjlmBrBuqYDEqFQv-utlRs3sqny9Tt14nQgfO0XRhSCtZDyGGJ5VlqwfPL6u5ugRJfe6lnHXMbySihk3fKnEYKYJ0WZ3sbPutLGFf-3JFAJFWlk",
  bike_name = "BMW R 1300 GS",
  airport_city = "Milan",
  airport_code = "MXP",
  route_name = "the Dolomites",
  price_day = "145",
  currency = "€",
  suitability_score = "9.8",
  mission_fit_review = "Electronic suspension and low-end torque optimized for Alpine switchbacks. High-altitude EFI mapping ensures peak power in the Dolomites. The BMW R 1300 GS delivers unprecedented agility for technical hairpin navigation.",
  operator_name = "EuroMotor",
  local_temp = "14°C",
  local_altitude = "2,450m",
  available_fleet_count = "04",
}) => {
  return (
    <div className="bg-[#050505] text-[#e5e2e1] font-sans antialiased selection:bg-[#eac26d] selection:text-[#402d00] overflow-x-hidden min-h-screen">
      
      {/* Global Styles (similar to the HTML head) */}
      <style dangerouslySetInnerHTML={{__html: `
        .glass-panel {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(12px);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .amber-glow:hover {
            box-shadow: 0 0 20px rgba(234, 194, 109, 0.3);
        }
        .ticker-scroll {
            display: flex;
            animation: ticker 30s linear infinite;
        }
        @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .font-headline { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-label { font-family: 'Space Grotesk', sans-serif; }
      `}} />

      {/* Navigation Layer (Optional in a SPA if BrandLayout is used, but included to match the design) */}
      <nav className="fixed top-0 z-50 w-full bg-[#050505]/80 backdrop-blur-xl border-b border-[#CDA755]/10">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-[1920px] mx-auto">
          <div className="text-2xl font-black tracking-tighter text-[#CDA755] uppercase font-headline">
            JETMYMOTO
          </div>
          <div className="hidden md:flex items-center gap-x-12">
            <Link className="font-label text-sm uppercase tracking-widest text-[#CDA755] border-b-2 border-[#CDA755] pb-1" to="#">Fleet</Link>
            <Link className="font-label text-sm uppercase tracking-widest text-gray-400 hover:text-white transition-colors" to="#">Logistics</Link>
            <Link className="font-label text-sm uppercase tracking-widest text-gray-400 hover:text-white transition-colors" to="#">Rentals</Link>
            <Link className="font-label text-sm uppercase tracking-widest text-gray-400 hover:text-white transition-colors" to="#">Missions</Link>
          </div>
          <div className="flex items-center gap-4">
            {/* Note: In a real React app, you'd use lucide-react or heroicons instead of material-symbols-outlined strings if not loaded globally */}
            <span className="material-symbols-outlined text-[#CDA755] cursor-pointer hover:bg-white/5 p-2 rounded transition-all">hub</span>
            <span className="material-symbols-outlined text-[#CDA755] cursor-pointer hover:bg-white/5 p-2 rounded transition-all">account_circle</span>
          </div>
        </div>
      </nav>

      <main className="pt-20"> {/* Offset for the fixed nav */}
        
        {/* 1. Cinematic Hero Area */}
        <section className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden flex flex-col items-center justify-center text-center px-8 pb-16">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-[#050505]/60 to-[#050505] z-10"></div>
            <img 
              className="w-full h-full object-cover" 
              alt={`Cinematic low angle shot of a ${bike_name} motorcycle`} 
              src={hero_image_url} 
            />
          </div>
          
          <div className="relative z-20 max-w-5xl pt-20 mb-16 flex-1 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 bg-[#eac26d]/10 border border-[#eac26d]/20 rounded-sm mx-auto">
              <span className="w-2 h-2 bg-[#eac26d] rounded-full animate-pulse"></span>
              <span className="font-label text-xs uppercase tracking-[0.2em] text-[#eac26d]">Mission Status: Active</span>
            </div>
            
            <h1 className="font-headline text-5xl md:text-8xl font-bold tracking-tight mb-6 leading-tight text-white">
              {bike_name} Deployment: <br/>
              <span className="text-[#eac26d] italic">{airport_city} ({airport_code})</span>
            </h1>
            
            <p className="text-xl md:text-3xl text-[#c6c6c9] max-w-3xl mx-auto mb-12 font-light">
              Optimized for {route_name}. Ship your bike or rent locally with tactical precision.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <button className="bg-[#eac26d] text-[#402d00] px-10 py-5 font-headline font-bold uppercase tracking-widest text-sm rounded-sm amber-glow transition-all active:scale-95 flex items-center gap-3">
                Initiate Protocol
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <button className="glass-panel text-white border border-white/10 px-10 py-5 font-headline font-bold uppercase tracking-widest text-sm rounded-sm hover:bg-white/10 transition-all active:scale-95">
                Technical Specs
              </button>
            </div>
          </div>
          
          <div className="relative z-20 flex flex-wrap justify-center gap-4 md:gap-8 w-full max-w-4xl mx-auto">
            <div className="glass-panel p-4 md:p-6 border-l-2 border-[#eac26d] flex-1 min-w-[200px] text-left">
              <p className="font-label text-[10px] uppercase tracking-widest text-[#c6c6c9] mb-1">Local Temp / Altitude</p>
              <p className="font-headline text-xl md:text-3xl font-bold text-white">{local_temp} / {local_altitude}</p>
            </div>
            <div className="glass-panel p-4 md:p-6 border-l-2 border-[#c6c6c9] flex-1 min-w-[200px] text-left">
              <p className="font-label text-[10px] uppercase tracking-widest text-[#c6c6c9] mb-1">Available Fleet</p>
              <p className="font-headline text-xl md:text-3xl font-bold text-white">{available_fleet_count} Units</p>
            </div>
          </div>
        </section>

        {/* Grayscale Trust Engineering Bar (Moved under hero) */}
        <div className="border-b border-white/5 bg-[#050505]">
          <TrustInfrastructure layout="marquee" />
        </div>

        {/* 2A. Logistics Module (Bring Your Machine) */}
        <section className="relative h-auto py-32 md:h-[819px] w-full flex flex-col justify-center items-center text-center overflow-hidden px-8 border-y border-white/5 bg-[#131313]">
          <div className="absolute inset-0 opacity-20 z-0">
            <img 
              className="w-full h-full object-cover grayscale" 
              alt="Interior of a high-tech logistics cargo plane" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkdKUaI2L-gFHQRQAaftyiq155Yu4_97opA1oY70Q4FLDIVtVyKiQMY-JfJ2X4zYNwt95I80LYseLg7jDnVkYQQl2qtN_ngT4Wlyt84pDlzVqIOYG_5HwKBB2Pmc4vzoWyFkXUiRn2wQo1BbtruAUKGGnITkFTR8GDMiqoXWJmgnQf4wvgEZzbmWAGuHSOQqhasFDWf0vnWumvxYbje4t1vch5pnF-_2Y1_BTCsM_xzyBzW89U3VXsqJmz29kyBztD1NTh8kRL5uw"
            />
          </div>
          <div className="relative z-10 max-w-4xl bg-[#050505]/60 p-12 backdrop-blur-sm border border-white/5 rounded-xl">
            <span className="font-label text-sm uppercase tracking-[0.4em] text-[#eac26d] mb-6 block">Operational Module 01: Logistics</span>
            <h2 className="font-headline text-4xl md:text-6xl font-bold mb-10 text-white">Bring Your Machine.</h2>
            <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16 mb-12">
              <div className="flex items-center gap-3 text-[#c6c6c9] justify-center">
                <span className="material-symbols-outlined text-[#eac26d]">security</span>
                <span>Global airlift monitoring</span>
              </div>
              <div className="flex items-center gap-3 text-[#c6c6c9] justify-center">
                <span className="material-symbols-outlined text-[#eac26d]">public</span>
                <span>Secure staging at {airport_code}</span>
              </div>
              <div className="flex items-center gap-3 text-[#c6c6c9] justify-center">
                <span className="material-symbols-outlined text-[#eac26d]">verified_user</span>
                <span>Customs Clearance handling</span>
              </div>
            </div>
            <button className="group relative inline-flex items-center gap-3 font-headline font-bold uppercase tracking-widest text-base text-[#eac26d] hover:text-white transition-colors">
              Request Shipping Quote
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-2">trending_flat</span>
            </button>
          </div>
        </section>

        {/* 2B. Rentals Module (Rent Locally) */}
        <section className="relative h-auto py-32 md:h-[819px] w-full flex flex-col justify-center items-center text-center overflow-hidden px-8 bg-[#1c1b1b]">
          <div className="absolute inset-0 opacity-20 z-0">
            <img 
              className="w-full h-full object-cover grayscale" 
              alt="Row of premium motorcycles lined up" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuByhWrYR9zoWVUK9EdsOOUZc9fA3FhjtpfK1G87UXLKl11UgfKXd2FoyEQbfC97wGHaQtcy7kemQ6gLd6nqHUs9dFEHRf7ZY6bJKnbvxMUiVyjIaDpmu8BgaZk1Uh7jsR2wlQ-2RWIsAgnzv_ahYpwjm6GmyHYPE67pOSdRRaMctHvl3I-B3FyNlTcCDipMjJLQWpP79O9F30gGIB6FprkQ3cuJ8Q0TLcngVAD0fv64TjIu0Wmps0JGYicGDJgTLnyQG5DQOpdp-v0"
            />
          </div>
          <div className="relative z-10 max-w-4xl bg-[#050505]/60 p-12 backdrop-blur-sm border border-white/5 rounded-xl">
            <span className="font-label text-sm uppercase tracking-[0.4em] text-[#eac26d] mb-6 block">Operational Module 02: Rentals</span>
            <h2 className="font-headline text-4xl md:text-6xl font-bold mb-10 text-white">Rent Locally.</h2>
            <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16 mb-12">
              <div className="flex items-center gap-3 text-[#c6c6c9] justify-center">
                <span className="material-symbols-outlined text-[#eac26d]">stadium</span>
                <span>Ready at {airport_code} arrivals</span>
              </div>
              <div className="flex items-center gap-3 text-[#c6c6c9] justify-center">
                <span className="material-symbols-outlined text-[#eac26d]">settings_input_component</span>
                <span>Factory-spec {bike_name}</span>
              </div>
              <div className="flex items-center gap-3 text-[#c6c6c9] justify-center font-mono font-bold text-white text-xl border-l border-[#eac26d] pl-6">
                {currency}{price_day} <span className="text-sm text-[#c6c6c9] font-sans font-normal ml-2">/ Day</span>
              </div>
            </div>
            <button className="bg-[#eac26d] text-[#402d00] px-12 py-6 font-headline font-bold uppercase tracking-widest text-sm rounded-sm amber-glow transition-all active:scale-95">
              Reserve This Machine
            </button>
          </div>
        </section>

        {/* 3. The "Mission-Fit" AI Dossier */}
        <section className="py-32 px-8 bg-[#1c1b1b] border-t border-white/5">
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            <span className="font-label text-xs uppercase tracking-[0.5em] text-[#eac26d] mb-12 block">Crucial Summary: Technical Assessment Dossier</span>
            
            <div className="w-full grid md:grid-cols-12 gap-12 items-center">
              <div className="md:col-span-4 flex flex-col items-center">
                <div className="glass-panel w-full p-16 aspect-square flex flex-col items-center justify-center relative border border-white/10 rounded-xl">
                  <div className="absolute inset-0 bg-[#eac26d]/5 rounded-full blur-[100px]"></div>
                  <span className="font-label text-sm uppercase tracking-widest text-[#c6c6c9] mb-4">Mission-Fit Score</span>
                  <div className="font-headline text-9xl font-black text-[#eac26d] tracking-tighter tabular-nums">{suitability_score}</div>
                  <div className="font-headline text-2xl text-[#eac26d]/60 font-medium mt-2">/ 10</div>
                </div>
              </div>
              
              <div className="md:col-span-8 text-left">
                <h3 className="font-headline text-4xl md:text-5xl font-bold mb-8 leading-tight text-white">Optimized for {route_name}.</h3>
                <p className="text-xl md:text-2xl text-[#e5e2e1] leading-relaxed font-light mb-12">
                  {mission_fit_review}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-white/10">
                  <div>
                    <p className="font-label text-xs uppercase tracking-widest text-gray-500 mb-2">Stability</p>
                    <p className="font-headline text-2xl font-bold text-white">EXTREME</p>
                  </div>
                  <div>
                    <p className="font-label text-xs uppercase tracking-widest text-gray-500 mb-2">Payload</p>
                    <p className="font-headline text-2xl font-bold text-white">220 KG</p>
                  </div>
                  <div>
                    <p className="font-label text-xs uppercase tracking-widest text-gray-500 mb-2">Range</p>
                    <p className="font-headline text-2xl font-bold text-white">400 KM</p>
                  </div>
                  <div>
                    <p className="font-label text-xs uppercase tracking-widest text-gray-500 mb-2">Response</p>
                    <p className="font-headline text-2xl font-bold text-white">MIL-SPEC</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Layer (Optional if BrandLayout is used, but included for complete standalone view) */}
      <footer className="bg-[#050505] py-20 border-t border-[#1c1b1b] pb-28 relative z-10">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
          <div className="max-w-xs">
            <div className="text-xl font-bold text-[#CDA755] font-headline mb-6 uppercase tracking-tighter">JETMYMOTO</div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Global precision logistics for the elite rider. From desert stages to alpine passes, we deploy your dream anywhere on earth.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-20 gap-y-10">
            <div className="flex flex-col gap-4">
              <p className="font-label text-xs uppercase tracking-widest text-[#eac26d] mb-2">Tactical</p>
              <Link className="text-gray-500 hover:text-[#CDA755] transition-colors text-sm" to="#">Tactical Protocols</Link>
              <Link className="text-gray-500 hover:text-[#CDA755] transition-colors text-sm" to="#">Deployment Areas</Link>
            </div>
            <div className="flex flex-col gap-4">
              <p className="font-label text-xs uppercase tracking-widest text-[#eac26d] mb-2">Support</p>
              <Link className="text-gray-500 hover:text-[#CDA755] transition-colors text-sm" to="#">Privacy</Link>
              <Link className="text-gray-500 hover:text-[#CDA755] transition-colors text-sm" to="#">Contact</Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 text-[10px] font-label tracking-[0.2em] text-gray-700 text-center uppercase">
          © 2026 JETMYMOTO PATRIOT COMMAND. OPERATIONAL PRECISION GUARANTEED.
        </div>
      </footer>

      {/* 5. The Live Staging Ticker (Pinned Bottom) */}
      <div className="fixed bottom-0 w-full h-10 bg-[#eac26d]/95 text-[#402d00] z-[100] overflow-hidden flex items-center border-t border-[#CDA755]">
        <div className="ticker-scroll whitespace-nowrap flex items-center">
          <span className="mx-12 font-label text-[10px] font-bold tracking-widest uppercase">{bike_name} staged at {airport_code} for Rider #882...</span>
          <span className="mx-12 font-label text-[10px] font-bold tracking-widest uppercase">{operator_name} cleared {airport_code} fleet inventory...</span>
          <span className="mx-12 font-label text-[10px] font-bold tracking-widest uppercase">Honda Africa Twin deployment confirmed for Tokyo (HND)...</span>
          <span className="mx-12 font-label text-[10px] font-bold tracking-widest uppercase">{bike_name} staged at {airport_code} for Rider #882...</span>
          <span className="mx-12 font-label text-[10px] font-bold tracking-widest uppercase">{operator_name} cleared {airport_code} fleet inventory...</span>
          <span className="mx-12 font-label text-[10px] font-bold tracking-widest uppercase">Honda Africa Twin deployment confirmed for Tokyo (HND)...</span>
        </div>
      </div>

    </div>
  );
};

export default PatriotPseoTemplate;
