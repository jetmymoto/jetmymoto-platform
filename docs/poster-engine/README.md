# Rider Atlas Prime Visual Engine

## 1. Purpose
The Rider Atlas Prime Visual Engine is the core system responsible for generating the high-fidelity, cinematic visual assets that define the JetMyMoto brand. It takes raw mission data and generative backgrounds, applies a strict, deterministic typography and layout matrix, and produces production-ready flattened images.

These flattened images are the ultimate source of truth for:
- Mission Dossier PDF Covers (Page 1)
- Mission Landing Pages
- Social Media Assets (Reels, Posts)
- Mission Briefing Cards

**Crucially, the PDF and landing pages should consume these flattened posters as single hero images. They must NOT attempt to recreate the typography layers via HTML/CSS over a raw background.**

## 2. Why this engine matters commercially
The Poster Engine is not just an aesthetic tool; it is a conversion asset. The layout is explicitly designed to carry the core sales message ("Turn a X-day trip into X full riding days") directly inside the visual. By flattening the copy into the image:
1.  **Platform Independence:** The message survives regardless of where the image is shared (Instagram, embedded in a PDF, sent via WhatsApp).
2.  **Typography Control:** It guarantees pixel-perfect typography, completely bypassing the severe font limitations of backend PDF renderers and varied email clients.
3.  **Brand Authority:** The "Quiet Authority" cinematic style is locked and unalterable by downstream display systems.

## 3. Folder & Output Structure
- **Core Script:** `scripts/poster-engine/generateMissionVisuals.cjs`
- **Background Generator (AI):** `scripts/poster-engine/generateMissionBackground.cjs`
- **Output (Standard Hero):** `gs://factory1/mission_dossiers/{missionId}/visuals/hero-poster.jpg` (1920x1080)
- **Output (PDF Cover):** `gs://factory1/mission_dossiers/{missionId}/visuals/dossier-cover.jpg` (1080x1350)
- **Output (Route Map):** `gs://factory1/mission_dossiers/{missionId}/visuals/route-geometry.jpg`
- **Output (Social Reel):** `gs://factory1/mission_dossiers/{missionId}/visuals/reel-preview.jpg`

## 4. Data Sources
1.  **Mission Data:** `missions_v1` collection in Firestore.
2.  **Background Images:**
    *   **Primary:** Existing approved backgrounds in `gs://factory1/mission_dossiers/{missionId}/backgrounds/`.
    *   **Secondary:** Vertex AI (Imagen 3) generation if no existing background is found.
    *   **Fallback:** Local `RA033_preview.jpg` if Vertex fails or quotas are hit.

## 5. Typography System
The typography is rendered deterministically using Node Canvas. It follows a strict hierarchy designed for maximum contrast against complex, dark photographic backgrounds.

### Layers (Top to Bottom)
*   **Top Labels:**
    *   Left: `RIDER ATLAS ORIGINAL` (White, letter-spaced)
    *   Right: `JETMYMOTO AIRLIFT` (White, letter-spaced)
*   **Mission Metadata:** `{missionId} // {missionTitle}` (Small, Gold #F4B900, letter-spaced)
*   **Mission Code:** `{missionId}` (Huge, Gold #F4B900, dominant element)
*   **Sales Headline:** `Turn a {days}-day motorcycle trip into {days} full riding days.` (Bold, White, Max 3 lines)
*   **Subcopy:** `Land at {startAirport}. Skip the rental depot, paperwork, luggage chaos and dead transfer time. Your machine is waiting. The mountains start today.` (Smaller, White, high legibility)

## 6. Layout Zones
*   **Background:** Full bleed. Rider/bike elements are permitted.
*   **Gradient Overlay:** A strengthening dark gradient from top to bottom. The gradient must be heavy enough in the lower 50% to guarantee text legibility, regardless of how bright the underlying AI generation is.
*   **Text Block (Dossier Cover):** Anchored in the **Lower-Left / Middle-Left** zone. All elements (Metadata, Code, Headline, Subcopy) stack vertically within this safe zone.
*   **Safe Margins:** Enforced on all sides (e.g., 80px on 1080x1350 canvas). Text must *never* overflow or touch the edge.

## 7. Font Controls
All fonts are managed within `createDossierCoverPoster` (for PDF covers) and `createCinematicPoster` (for standard visuals) inside `scripts/poster-engine/generateMissionVisuals.cjs`.

### Important Font Rules:
-   **NO Google Fonts CDN.**
-   **NO remote font fetching.**
-   Use local fonts or robust system fallback stacks (`Inter, Helvetica, Arial, sans-serif`).
-   If custom `.ttf`/`.woff` files are added, they must be stored locally and registered with the Canvas renderer using `registerFont()`.
-   Never share licensed font files publicly.

### Suggested Font Hierarchy:
-   **Mission Code:** Heavy Condensed / Bold Sans (`900`)
-   **Headline:** Bold Sans (`900`)
-   **Subcopy:** Regular Sans (`400`)
-   **Metadata/Labels:** Bold Uppercase Sans (`800`) with letter spacing.

## 8. How to change fonts
Open `scripts/poster-engine/generateMissionVisuals.cjs` and locate `createDossierCoverPoster`:

*   **Top Labels:** Look for `// 3. TOP LABELS`. Adjust `ctx.font = '800 14px ...';`
*   **Mission Metadata:** Look for `// Small Gold Line`. Adjust `ctx.font = '800 18px ...';`
*   **Mission Code:** Look for `// Huge Gold Code`. Adjust `const codeFontSize = 140;` and `ctx.font = '900 ${codeFontSize}px ...';`
*   **Headline:** Look for `// Main White Headline`. Adjust `const headlineStartSize = 64;`, `headlineMinSize`, and `ctx.font = '900 ${headlineSize}px ...';` within the `fitTextToBox` call.
*   **Subcopy:** Look for `// Subcopy`. Adjust `const subcopyStartSize = 34;`, `subcopyMinSize`, and `ctx.font = '400 ${subcopySize}px ...';` within the `fitTextToBox` call.

## 9. How to change headline copy
Open `scripts/poster-engine/generateMissionVisuals.cjs` and locate `createDossierCoverPoster`. Modify the template literal for `headlineText` and `subcopyText`. **Ensure you maintain dynamic variables where appropriate (e.g., pulling duration from `missionData.stats.days`).**

## 10. How to generate one poster
Run the orchestration script directly:
```bash
node scripts/poster-engine/generateMissionVisuals.cjs RA033
```

## 11. How to batch-generate posters
To run generation across the entire fleet sequentially (with built-in delay cooling to protect APIs):
```bash
node scripts/poster-engine/batchGenerateMissionVisuals.cjs
```

## 12. How PDFs should consume posters
The `mission-dossier-template.html` (the PDF renderer) must pull the finalized `dossier-cover.jpg` via a signed URL or embedded Data URI and set it as the full-bleed background for Page 1.
**Do not overlay HTML text on top of this image.** The poster already contains the necessary sales copy and mission identifiers.

## 13. Common Failure Modes
*   **Overflow Detected:** The engine throws an `overflow_error` if the text stack exceeds the canvas height. This usually means the subcopy is too long or the font sizes are too large. **The engine will abort the PDF cover export to prevent broken assets.**
*   **Black Poster:** If the background image fails to load or the Vertex AI generation results in a black image, the engine should gracefully fail over to the local `RA033_preview.jpg`. Ensure this fallback image is always present.
*   **403 Forbidden on Assets:** Always use the Firebase Admin SDK to fetch assets from protected buckets (like `movie-chat-factory-assets`), not raw HTTP `fetch`.

## 14. Do / Don't Rules
*   **DO** ensure the background gradient is dark enough to support white text.
*   **DO** use responsive text fitting (`fitTextToBox`).
*   **DO** validate that the poster generates cleanly before committing layout changes.
*   **DON'T** let Vertex AI generate text. AI typography is unreliable.
*   **DON'T** remove the safe margins.
*   **DON'T** bypass the Canvas compositor for the final visual.

## 15. Approved Reference
**RA049 PDF-Cover Poster (Production Standard):**
`gs://factory1/testposters01/RA049-cover.jpg`

---

## Agent Rules (AI Directives)
-   **Do not redesign the layout without explicit user approval.**
-   **Do not replace the poster text system with random AI typography.**
-   **Do not let Vertex generate text inside images.** Vertex may generate backgrounds only.
-   **Canvas owns all typography.**
-   **Final poster is the source of truth for PDF Page 1.**
-   **The PDF should use the flattened poster image as a hero, not recreate poster layers in HTML.**
