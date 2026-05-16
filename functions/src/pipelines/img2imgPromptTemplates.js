export const IMG2IMG_TEMPLATES = {
  "studio-normalize": {
    prompt:
      "Premium motorcycle in clean studio environment, deep black background #050505, subtle gold rim lighting #CDA755, sharp product photography, professional catalog image, 8K resolution",
    negativePrompt:
      "outdoor, nature, road, distorted motorcycle parts, cartoon, anime, text overlay, watermark, blurry, low quality",
    strength: 0.25,
    guidanceScale: 7.5,
    steps: 40,
    purpose: "Unify all rental images to consistent luxury studio look",
  },
  "color-grade-luxury": {
    prompt:
      "Same motorcycle, premium color grading, deep contrast, warm amber highlights #CDA755, cinematic shadow depth, professional photography",
    negativePrompt:
      "flat colors, washed out, oversaturated, distorted parts, cartoon, anime",
    strength: 0.15,
    guidanceScale: 6.0,
    steps: 30,
    purpose: "Apply brand luxury palette without changing composition",
  },
  "composition-cleanup": {
    prompt:
      "Same motorcycle centered in frame, clean minimal background, professional product photography, sharp focus on motorcycle",
    negativePrompt:
      "clutter, text, people, multiple vehicles, distorted, cartoon, watermark",
    strength: 0.20,
    guidanceScale: 7.0,
    steps: 35,
    purpose: "Remove visual noise and center the subject",
  },
  "cinematic-outdoor": {
    prompt:
      "Motorcycle parked on mountain road at golden hour, cinematic composition, shallow depth of field, warm lighting, professional travel photography",
    negativePrompt:
      "distorted parts, fake, cartoon, indoor, studio, flat lighting",
    strength: 0.35,
    guidanceScale: 7.0,
    steps: 35,
    purpose: "Create scenic hero images for routes and destinations",
  },
};

export const TEMPLATE_FOR_ENTITY = {
  rental: "studio-normalize",
  overlay: "studio-normalize",
  route: "cinematic-outdoor",
  destination: "cinematic-outdoor",
  hero: "color-grade-luxury",
};
