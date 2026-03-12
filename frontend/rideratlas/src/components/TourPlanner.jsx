import React, { useState, useEffect } from 'react';
import './TourPlanner.css';

const MISSION_STYLES = [
  { id: 'balanced', label: 'Balanced Tour', copy: 'Well-paced mix of curves, scenery and good food.' },
  { id: 'photo', label: 'Photo Safari', copy: 'Route tuned for epic viewpoints, golden hours and photo stops.' },
  { id: 'tech', label: 'Fast & Technical', copy: 'High-tempo roads, tight passes and rider-focused stages.' },
  { id: 'luxury', label: 'Luxury Escape', copy: 'Shorter riding days, premium hotels and relaxed rhythm.' },
];

const TEMPO_CONFIG = {
  chilled: { label: "Chilled, café stops", difficulty: "Easy", kmPerDay: 180, curves: "80–100" },
  scenic: { label: "Scenic, photo stops", difficulty: "Intermediate", kmPerDay: 230, curves: "130–170" },
  spirited: { label: "Spirited, rider focus", difficulty: "Advanced", kmPerDay: 280, curves: "180–230" },
  attack: { label: "Attack, max twisties", difficulty: "Expert", kmPerDay: 320, curves: "230+" },
};

const TourPlanner = () => {
  const [missionStyle, setMissionStyle] = useState('balanced');
  const [days, setDays] = useState(4);
  const [tempo, setTempo] = useState('scenic');
  const [riders, setRiders] = useState('2');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('Ready when you are.');
  const [suggestions, setSuggestions] = useState(null);

  // Derived state for stats
  const stats = TEMPO_CONFIG[tempo] || TEMPO_CONFIG.scenic;
  const totalKm = stats.kmPerDay * days;
  const activeStyleConfig = MISSION_STYLES.find(s => s.id === missionStyle) || MISSION_STYLES[0];
  const previewCopy = activeStyleConfig.copy;

  const handleGenerate = () => {
    setIsGenerating(true);
    setStatus("Plotting passes and fuel stops…");
    
    setTimeout(() => {
      setIsGenerating(false);
      setStatus("3 draft missions ready. Refine or lock one in.");
      
      const baseSuggestions = [
        `• Alpine Apex loop with ${days} stages and airport pickup.`,
        "• Lake-and-passes combo with one easier recovery day.",
        "• One wildcard detour chosen purely for views.",
      ];

      if (tempo === "attack") {
        baseSuggestions[0] = "• High-density passes chain with minimal transfers.";
      }

      setSuggestions(baseSuggestions);
    }, 900);
  };

  // Update status on typing
  useEffect(() => {
    if (prompt.length > 12 && !isGenerating && !suggestions) {
      setStatus("Dialling the route around your story…");
    } else if (prompt.length <= 12 && !suggestions) {
      setStatus("Ready when you are.");
    }
  }, [prompt, isGenerating, suggestions]);

  return (
    <section id="tour-planner" className="ra-section">
      <header className="ra-header">
        <div>
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-widest bg-white/5 text-slate-400 uppercase mb-2">Beta Access</span>
          <h1 className="ra-title">Design your mission in one prompt.</h1>
          <p className="ra-subtitle">
            Tell Rider Atlas how you like to ride – then watch it stitch together airports, passes and stays into a cinematic route.
          </p>
        </div>
        <div className="ra-steps">
          <span className="ra-step ra-step-active">1. Describe</span>
          <span className="ra-step">2. Tune</span>
          <span className="ra-step">3. Preview</span>
          <span className="ra-step">4. Book</span>
        </div>
      </header>

      <div className="ra-grid">
        <div className="ra-map-panel">
          <div className="ra-map-layer ra-map-image"></div>
          <div className="ra-map-layer ra-map-grid"></div>
          <div className="ra-map-layer ra-map-route"></div>

          {/* Map Pins - purely decorative */}
          <div className="ra-pin ra-pin-1">
            <span className="ra-pin-label">INNSBRUCK</span>
          </div>
          <div className="ra-pin ra-pin-2">
            <span className="ra-pin-label">ZÜRICH</span>
          </div>
          <div className="ra-pin ra-pin-3">
            <span className="ra-pin-label">LAKE GARDA</span>
          </div>

          <div className="ra-prompt-card">
            {/* New Style Selector */}
            <div className="ra-style-selector">
              <div className="ra-style-header">Choose a mission style</div>
              <div className="ra-pills">
                {MISSION_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setMissionStyle(style.id)}
                    className={`ra-pill ${missionStyle === style.id ? 'active' : ''}`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Prompt */}
            <label htmlFor="ra-prompt" className="ra-prompt-label">
              Describe your mission
            </label>
            <textarea
              id="ra-prompt"
              className="ra-prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 5 days in June, spirited pace, sleep in boutique hotels, focus on coastal roads and photo spots for sunrise and sunset."
            ></textarea>

            {/* Controls */}
            <div className="ra-controls-row">
              <div className="ra-control">
                <label htmlFor="ra-days">Days</label>
                <select 
                  id="ra-days" 
                  className="ra-select" 
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                >
                  {[3, 4, 5, 6, 7, 8, 9, 10].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="ra-control">
                <label htmlFor="ra-tempo">Riding tempo</label>
                <select 
                  id="ra-tempo" 
                  className="ra-select"
                  value={tempo}
                  onChange={(e) => setTempo(e.target.value)}
                >
                  <option value="chilled">Chilled</option>
                  <option value="scenic">Scenic</option>
                  <option value="spirited">Spirited</option>
                  <option value="attack">Attack mode</option>
                </select>
              </div>
              <div className="ra-control">
                <label htmlFor="ra-riders">Riders</label>
                <select 
                  id="ra-riders" 
                  className="ra-select"
                  value={riders}
                  onChange={(e) => setRiders(e.target.value)}
                >
                  <option value="1">Solo</option>
                  <option value="2">2 riders</option>
                  <option value="4">3–4 riders</option>
                  <option value="6">5+ crew</option>
                </select>
              </div>
            </div>

            <div className="ra-actions">
              <button onClick={handleGenerate} className="ra-btn-main">
                Generate Tour
              </button>
              <span className="ra-ai-status">{status}</span>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="ra-preview-panel">
          <div className="ra-preview-card">
            <p className="ra-preview-eyebrow">Live Mission Preview</p>
            <h3 className="ra-preview-title">
              Alpine Aperture · {days}-Day {tempo.charAt(0).toUpperCase() + tempo.slice(1)}
            </h3>

            <div className="ra-preview-stats">
              <div className="ra-stat">
                <span className="ra-stat-label">Estimated distance</span>
                <span className="ra-stat-value">{totalKm} km</span>
              </div>
              <div className="ra-stat">
                <span className="ra-stat-label">Curves per day</span>
                <span className="ra-stat-value">{stats.curves}</span>
              </div>
              <div className="ra-stat">
                <span className="ra-stat-label">Ride tempo</span>
                <span className="ra-stat-value">{stats.label}</span>
              </div>
              <div className="ra-stat">
                <span className="ra-stat-label">Difficulty</span>
                <span className="ra-stat-value">{stats.difficulty}</span>
              </div>
            </div>

            <div className="ra-preview-footer">
              <p>“{previewCopy}”</p>
            </div>
          </div>

          <div className="ra-suggestions">
            {suggestions ? (
              <>
                <span className="ra-suggestions-label">Draft missions:</span>
                <ul>
                  {suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </>
            ) : (
              <span className="italic opacity-50">AI suggestions will appear here after you generate...</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TourPlanner;