const { VertexAI } = require("@google-cloud/vertexai");
const { z } = require("zod");
const crypto = require("crypto");
const { db } = require("../../lib/firebaseAdmin");

// ── Schema Definition ────────────────────────────────────────────────────

const MissionIntelligenceSchema = z.object({
  rider_fit_analysis: z.string(),
  machine_match_logic: z.string(),
  time_recovery_estimate: z.string(),
  execution_recommendation: z.string(),
  technical_terrain_advisory: z.string(),
});

// ── Fallback Copy (Quiet Authority) ──────────────────────────────────────

const QUIET_AUTHORITY_FALLBACK = {
  rider_fit_analysis: "Mission profile optimized for executive deployment. Tactical alignment verified.",
  machine_match_logic: "Asset selection verified for technical alpine corridors. Geometry preserves mission integrity.",
  time_recovery_estimate: "Logistics layer optimized for maximum saddle time. Net gain: +1 full riding day.",
  execution_recommendation: "Initiate deployment via verified staging hubs. Zero-friction handover confirmed.",
  technical_terrain_advisory: "Sustained concentration required for high-altitude sectors. Phase 2 traps identified.",
};

const A2A_FALLBACK = {
  rider_fit_analysis: "Operative profile cleared for restricted mobility access. Tactical fit for high-tempo alpine repositioning verified.",
  machine_match_logic: "Flagship performance asset selected for sustained corridor transit. Mechanical envelope verified for technical extraction.",
  time_recovery_estimate: "Logistical friction eliminated. Net gain: +2 tactical riding days via direct airport-to-pass insertion.",
  execution_recommendation: "Initiate transfer via Hub Alpha. Coordinated extraction at Sector Node confirmed. No administrative delay permitted.",
  technical_terrain_advisory: "High-altitude technical sectors ahead. Sustained concentration mandatory. No margin for tourism-level fatigue.",
};

// ── Vertex AI Setup ──────────────────────────────────────────────────────

const vertex = new VertexAI({
  project: "movie-chat-factory",
  location: "us-central1",
});

const model = vertex.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: `You are the JetMyMoto Mission Intelligence engine. 
Tone: 'Elite Underground' — ruthless, mechanically precise, high-agency. 
Rules:
1. NO tourism phrasing. No "enjoy the views", no "wonderful journey".
2. Use professional, tactical, and slightly aggressive language.
3. Treat the rider as a 'Selected Operative' or 'VIP Asset'.
4. Focus on 'Restricted Access', 'Corridor Intelligence', and 'Time Recovery'.
5. Use terms: Mission Intelligence, Operative Profile, Machine Match Logic, Time Recovery Estimate, Execution Recommendation.`,
});

// ── Service Implementation ───────────────────────────────────────────────

/**
 * Generates or retrieves cached AI-powered mission intelligence.
 */
async function hydrateMissionIntelligence(missionData, riderProfile) {
  const missionId = missionData.slug;
  const riderHash = crypto
    .createHash("md5")
    .update(JSON.stringify(riderProfile))
    .digest("hex");
  
  const cacheKey = `${missionId}_${riderHash}`;
  const cacheRef = db.collection("dossier_intelligence").doc(cacheKey);

  // 1. Check Cache
  try {
    const cacheDoc = await cacheRef.get();
    if (cacheDoc.exists) {
      console.log(`[Intelligence] Cache hit for ${cacheKey}`);
      return cacheDoc.data();
    }
  } catch (err) {
    console.warn(`[Intelligence] Cache read failed: ${err.message}`);
  }

  // 2. Call Vertex AI
  console.log(`[Intelligence] Hydrating via Vertex AI for ${missionId}...`);
  
  const isA2A = missionData.missionType === 'a2a';
  
  let missionContext = '';
  if (isA2A) {
    missionContext = `
This is an A2A (Airport-to-Airport) Mission. 
Focus on:
- Fleet repositioning economics: This is a high-value logistical operation.
- Subsidy logic: The rider receives a ${missionData.subsidy_pct || 0}% subsidy for participating in fleet rebalancing.
- Frame the rider as a "VIP Logistical Asset" or "Operative" executing a tactical transfer.
- Stylistic directive: Hyper-Tactile Mechanical Brutalist. 
- Avoid all tourism phrasing (no "enjoy the view", "scenic vacation", "wonderful trip").
`;
  }

  const prompt = `
Analyze this mission:
${JSON.stringify(missionData, null, 2)}

For this rider profile:
${JSON.stringify(riderProfile, null, 2)}

${missionContext}

Return a JSON object matching the requested schema.
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            rider_fit_analysis: { type: "string" },
            machine_match_logic: { type: "string" },
            time_recovery_estimate: { type: "string" },
            execution_recommendation: { type: "string" },
            technical_terrain_advisory: { type: "string" },
          },
          required: [
            "rider_fit_analysis",
            "machine_match_logic",
            "time_recovery_estimate",
            "execution_recommendation",
            "technical_terrain_advisory",
          ],
        },
      },
    });

    const textResult = result.response.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(textResult);

    // 3. Validate with Zod
    const validated = MissionIntelligenceSchema.parse(parsed);

    // 4. Cache Result
    await cacheRef.set({
      ...validated,
      generatedAt: new Date().toISOString(),
      missionId,
      riderHash,
    });

    return validated;

  } catch (err) {
    console.error(`[Intelligence] Vertex/Validation failed: ${err.message}`);
    console.warn(`[Intelligence] Reverting to Quiet Authority fallback.`);
    return isA2A ? A2A_FALLBACK : QUIET_AUTHORITY_FALLBACK;
  }
}

module.exports = {
  hydrateMissionIntelligence,
  MissionIntelligenceSchema,
  QUIET_AUTHORITY_FALLBACK,
};
