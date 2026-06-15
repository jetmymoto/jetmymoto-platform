# RIDERATLAS V2 — TARGET ARCHITECTURE

## 1. Directory Structure

```text
src/
 ├─ app/                 # Application shell, router, providers
 ├─ core/                # Infrastructure & Shared Logic
 │   ├─ graph/           # Tier A: Network graph & shards
 │   ├─ firebase/        # Tier A: DB & Auth config
 │   ├─ analytics/       # Tier A: Tracking & Metrics
 │   └─ routing/         # Canonical URL & Navigation logic
 ├─ brand/               # Theme tokens, logos, identity
 ├─ features/            # Domain-driven features
 │   ├─ airport/         # Gateway engine, hubs, logistics
 │   ├─ media/           # Tier B: Media Director, resolvers
 │   ├─ rentals/         # Fleet, checkout, live feed
 │   └─ routes/          # Mission landing, route cinema
 ├─ shared/              # Atomic UI components & hooks
 └─ styles/              # Global, layout, and component CSS
```

## 2. Technical Mandates

### TypeScript First
Every file migrated to `rideratlas-clean-core` MUST be converted to TypeScript (.ts/.tsx).

### Atomic Components
Components like `AirportGatewayLayout` must be decomposed into a Shell/Layout and independent sections (Hero, RouteCinema, etc.). No section should exceed 300 lines.

### Media Director Decoupling
The resolution engine must be split into:
1.  **Guards:** Pure functions for cross-contamination checks.
2.  **Scoring:** Weighted logic for asset selection.
3.  **Resolvers:** Feature-specific entry points (Airport, Mission, Fleet).

### CSS Strategy
1.  **Tokens:** `src/styles/tokens.css` (Colors, Spacing, Typography).
2.  **Layout:** `src/styles/layout.css` (Grid systems, Shells).
3.  **Components:** Encapsulated CSS files per major feature/component.
4.  **Animations:** Standardized Framer Motion variants.

## 3. Data Strategy
- **Graph Shards:** Maintain the lazy-loading JSON strategy for Tier A performance.
- **Firestore:** Strict isolation of data fetching into feature-specific services.
- **Local State:** Prefer standard React hooks; avoid global state unless for Auth/Config.
