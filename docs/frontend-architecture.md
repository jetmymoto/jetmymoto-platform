# JetMyMoto Frontend Architecture

## Platform Overview

The JetMyMoto frontend is a specialized logistics and expedition platform designed for motorcycle shipping and riding route discovery. Unlike traditional e-commerce or travel sites, the architecture is built around a **network-driven logistics model**.

The entire UI is powered by a central **Graph Engine** that manages the relationships between airports (logistics hubs), riding routes, and geographic destinations.

## Core Data Engine

The system relies on a central `GRAPH` object, which is built once at application startup and serves as the single source of truth for the network.

### Structure

The `GRAPH` object contains indexed collections for O(1) or O(log n) lookups:

```javascript
GRAPH = {
  airports: { "MXP": { ... }, "JFK": { ... } },
  routes: { "route-slug": { ... } },
  destinations: { "destination-slug": { ... } },
  clusters: { "mxp-network": { ... } },

  // Indexed Fields (Critical for Performance)
  routesByAirport: { "MXP": ["route-1", "route-2"] },
  routesByDestination: { "tuscany": ["route-1"] }
}
```

### Why Indexes?

Indexed fields enable the UI to perform fast lookups without scanning the entire route array. For example, `GRAPH.routesByAirport["MXP"]` immediately returns all routes connected to Milan Malpensa.

## UI Rendering Pipeline

The UI follows a top-down hierarchy that mirrors the physical logistics flow:

1.  **GlobalTower**: The high-level network overview and continent explorer.
2.  **RidingTheaters**: Regional clusters (hubs) that group airports and their connected riding regions.
3.  **AirportTemplate**: The "Mission Control" interface for a specific airport hub.
4.  **Routes**: Specific expedition paths originating from a hub.
5.  **Destinations**: The final riding regions or points of interest.

## Routing Architecture

The platform uses canonical, SEO-friendly routing patterns:

### Airport Pages

Airport pages use the `/airport/:code` pattern and are rendered by the `AirportTemplate` component.

- `/airport/mxp` (Milan)
- `/airport/cdg` (Paris)
- `/airport/yvr` (Vancouver)

### Route & Destination Pages

- `/route/:slug` — Individual expedition routes.
- `/destination/:slug` — Regional riding hubs.

## Major UI Components

### GlobalTower

The entry point for network exploration. It provides a radar-like overview of the global infrastructure and allows users to drill down by continent and country.

### RidingTheaters (AdventureNetworkCard)

A "Theater" is a logical grouping of routes and destinations around an airport hub. These are rendered as `AdventureNetworkCard` components, providing a preview of the regional network.

### AirportTemplate

The canonical renderer for airport-specific data. It handles logistics details, weather, staging info, and available routes for a specific hub.

### DeploymentCard

Used within the GlobalTower and regional pages to show "certified deployment hubs"—the airports where motorcycles are received.

### AdventureNetworkCard

Displays the "Cluster" network, showing a summary of riding opportunities in a specific geographic sector.

## Data Flow (GRAPH → UI)

UI components are designed to be "Graph-Aware." Instead of managing independent state or fetching data per-component, they consume the global graph:

1.  **Context**: The `NetworkGraphContext` provides the `GRAPH` object to the component tree.
2.  **Derivation**: Components derive their display state by querying the graph.
    - _Example_: A sidebar showing nearby airports will use `GRAPH.airports` and filter by geographic proximity.
3.  **Direct Import**: For performance-critical pages, the `GRAPH` object can be imported directly from `@/core/network/networkGraph`.

## Performance Design

To ensure a "HUD-like" responsive experience, several architectural decisions were made:

- **Graph Indexes**: Prevents expensive `Array.find` or `Array.filter` operations on large datasets.
- **Centralized Data Source**: Data is hydrated once, reducing runtime processing.
- **Limited Route Rendering**: High-traffic pages (like GlobalTower) render optimized "intel" cards instead of full route dossiers.
- **Simplified Routing**: Uses a flat routing structure to minimize component nesting depth.

## Developer Guidelines

- **Do not scan `GRAPH.routes` directly**: Always use `routesByAirport` or `routesByDestination` indexes.
- **Use the Template**: All airport-specific pages must use the `AirportTemplate` to ensure UI consistency.
- **URL Patterns**: Always use the `/airport/:code` pattern for hub-level navigation.
- **Hydration**: If adding new data types (e.g., POIs), ensure they are indexed in `buildNetworkGraph.js` during the hydration phase.

## Navigation Model

The user journey follows a logical "Zoom-In" model:

1.  **GlobalTower**: "Where in the world can I go?"
2.  **Cluster Networks**: "What riding theaters are available in this region?"
3.  **Airport Hub**: "How do I land and stage my machine here?"
4.  **Routes/Destinations**: "What is my specific mission?"
