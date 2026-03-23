export const CINEMATIC_POSITIVE_PROMPT_TEMPLATE =
  "Cinematic tracking shot of a {brand} {model} tearing through " +
  "{destination_backdrop}. Premium luxury-tactical motorcycle " +
  "commercial, photoreal live-action motion, dramatic alpine " +
  "atmosphere, deep charcoal-black palette anchored in #050505 " +
  "across shadows, asphalt, wardrobe, and body reflections, warm " +
  "amber rim light and sunset accents in the #CDA755 range, heavy " +
  "contrast, controlled highlights, shallow haze, crisp machine " +
  "detail, realistic suspension movement, high-speed camera car " +
  "feel, 8k, raw cinematic realism, no studio look.";

export const CINEMATIC_NEGATIVE_PROMPT =
  "text, typography, captions, subtitles, watermark, logo, UI, " +
  "HUD, dashboard overlay, borders, frames, split screen, poster " +
  "layout, infographic styling, product card, interface elements, " +
  "floating labels, pure black #000000 void background, neon glow, " +
  "sci-fi holograms, cartoon, anime, illustration, low detail, " +
  "duplicate wheels, malformed rider, deformed hands, broken " +
  "anatomy, fake motion blur, CGI toy look";

module.exports = {
  CINEMATIC_POSITIVE_PROMPT_TEMPLATE,
  CINEMATIC_NEGATIVE_PROMPT,
};

module.exports.default = module.exports;
