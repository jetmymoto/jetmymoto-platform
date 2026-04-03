import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const TAG_PROMPT = `Analyze this motorcycle image for a luxury motorcycle travel platform.

Return ONLY a JSON object with this exact structure:
{
  "imageType": "studio" | "action" | "lifestyle" | "detail",
  "composition": "side_profile" | "front_angle" | "three_quarter" | "rear" | "close_up" | "rider_pov" | "leading_lines" | "panoramic",
  "framing": "wide" | "medium" | "tight",
  "lighting": "studio_soft" | "golden_hour" | "overcast" | "high_contrast" | "dramatic" | "rim_light",
  "background": "studio" | "road" | "mountain" | "urban" | "abstract" | "coastal" | "forest" | "desert",
  "subject": "motorcycle" | "rider" | "environment" | "detail_part",
  "brand": "string or null",
  "model": "string or null",
  "tags": ["string"],
  "emotion": "power" | "freedom" | "awe" | "calm" | "adventure",
  "brandRecognizable": true/false,
  "qualityScore": 0.0-1.0,
  "cinematicScore": 0.0-1.0,
  "compositionScore": 0.0-1.0,
  "structuralIntegrity": 0.0-1.0,
  "reject": true/false,
  "rejectReason": "string or null"
}

Field guide:
- imageType: studio=controlled product shot, action=riding/moving, lifestyle=rider culture/gear, detail=close-up of parts
- composition: camera angle and framing style
- framing: wide=full scene, medium=bike+context, tight=close crop
- lighting: dominant light quality in the image
- background: primary backdrop category
- subject: main visual subject
- brand: motorcycle brand if recognizable (e.g. "BMW", "Ducati"), null if not
- model: specific model if identifiable (e.g. "R1250GS", "Multistrada V4"), null if not
- tags: 3-8 descriptive tags (e.g. "exhaust", "wheel", "dashboard", "cornering", "alpine", "sunset")
- qualityScore: overall image quality (resolution, sharpness, noise)
- cinematicScore: premium visual appeal (lighting drama, color depth, mood)
- compositionScore: framing, subject placement, visual balance
- structuralIntegrity: motorcycle parts accuracy (wheels, exhausts, controls all correct)
- brandRecognizable: can the specific motorcycle brand/model be identified?
- reject: true if image is unusable (watermarks, heavy crop, distorted, too small, not motorcycle-related)`;

const STRUCTURAL_QC_PROMPT = `Compare this AI-generated motorcycle image against the requirements for premium product display.

Return ONLY a JSON object:
{
  "brandAccuracy": 0.0-1.0,
  "cinematicScore": 0.0-1.0,
  "compositionQuality": 0.0-1.0,
  "structuralIntegrity": 0.0-1.0,
  "reject": true/false,
  "rejectReason": "string or null"
}

Reject if:
- Motorcycle parts are distorted (merged exhausts, wrong wheel count, melted controls)
- Background artifacts or visual noise
- Brand/model is no longer recognizable
- Image looks obviously AI-generated (plastic texture, impossible geometry)`;

async function callGeminiVision(imageBuffer, prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not set in environment");
  }

  const base64Image = imageBuffer.toString("base64");

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Image,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
    },
  };

  const response = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini Vision API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textResult) {
    throw new Error("Empty response from Gemini Vision API");
  }

  return JSON.parse(textResult);
}

export async function tagImage(imageBuffer) {
  try {
    const result = await callGeminiVision(imageBuffer, TAG_PROMPT);
    // Normalize: map legacy "type" to "imageType" if Gemini returns old field
    if (result.type && !result.imageType) {
      result.imageType = result.type;
    }
    // Ensure new fields have defaults
    return {
      imageType: result.imageType || result.type || "studio",
      framing: result.framing || "medium",
      lighting: result.lighting || "studio_soft",
      background: result.background || null,
      subject: result.subject || "motorcycle",
      brand: result.brand || null,
      model: result.model || null,
      tags: result.tags || [],
      // Legacy compat: keep "type" for existing consumers
      type: result.imageType || result.type || "studio",
      composition: result.composition || "side_profile",
      emotion: result.emotion || "power",
      brandRecognizable: result.brandRecognizable ?? false,
      qualityScore: result.qualityScore || 0,
      cinematicScore: result.cinematicScore || 0,
      compositionScore: result.compositionScore || 0,
      structuralIntegrity: result.structuralIntegrity || 0,
      reject: result.reject || false,
      rejectReason: result.rejectReason || null,
    };
  } catch (error) {
    console.error("[QualityGate] Tagging failed:", error.message);
    return {
      imageType: "studio",
      type: "studio",
      composition: "side_profile",
      framing: "medium",
      lighting: "studio_soft",
      background: null,
      subject: "motorcycle",
      brand: null,
      model: null,
      tags: [],
      emotion: "power",
      brandRecognizable: false,
      qualityScore: 0,
      cinematicScore: 0,
      compositionScore: 0,
      structuralIntegrity: 0,
      reject: true,
      rejectReason: `Vision API failure: ${error.message}`,
    };
  }
}

export async function validateGenerated(imageBuffer) {
  try {
    const result = await callGeminiVision(imageBuffer, STRUCTURAL_QC_PROMPT);

    const hardReject =
      result.brandAccuracy < 0.85 ||
      result.cinematicScore < 0.80 ||
      result.structuralIntegrity < 0.90;

    if (hardReject && !result.reject) {
      return {
        ...result,
        reject: true,
        rejectReason:
          result.rejectReason ||
          `Hard gate failed: brand=${result.brandAccuracy} cinematic=${result.cinematicScore} structural=${result.structuralIntegrity}`,
      };
    }

    return result;
  } catch (error) {
    console.error("[QualityGate] Validation failed:", error.message);
    return {
      brandAccuracy: 0,
      cinematicScore: 0,
      compositionQuality: 0,
      structuralIntegrity: 0,
      reject: true,
      rejectReason: `Vision API failure: ${error.message}`,
    };
  }
}

export function computeCompositeScore(tags) {
  const weights = {
    qualityScore: 0.3,
    cinematicScore: 0.3,
    compositionScore: 0.2,
    structuralIntegrity: 0.2,
  };

  return Object.entries(weights).reduce(
    (sum, [key, weight]) => sum + (tags[key] || 0) * weight,
    0
  );
}
