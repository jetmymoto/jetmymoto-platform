# JetMyMoto Platform Architecture Diagram

## 1. Core Data Engine

The JetMyMoto platform relies on a centralized data pipeline to gather disparate geographic and routing information into a cohesive, in-memory graph.

```mermaid
flowchart TD
  A1[airportIndex.js] --> B[buildNetworkGraph.js]
  A2[rideDestinations.js] --> B
  A3[destinationRegions.js] --> B
  A4[missions-na.csv] --> B
  A5[routeFeeds.js] --> B

  B --> C[networkGraph.js]
  C --> D[GRAPH]
```

## 2. GRAPH Data Structure

The `GRAPH` object serves as the single source of truth for the frontend application, containing dictionaries and pre-computed indexes for O(1) lookups.

```mermaid
flowchart LR
  G[GRAPH] --> A[airports]
  G --> R[routes]
  G --> RA[routesByAirport]
  G --> D[destinations]
  G --> C[clusters]

  A -.-> E1[MXP]
  A -.-> E2[CDG]
  A -.-> E3[LHR]
  A -.-> E4[YVR]
```

## 3. GlobalTower Rendering Pipeline

The GlobalTower acts as the top-level view, pulling data from the `GRAPH` and distributing it down to regional and granular component layers.

```mermaid
flowchart TD
  G[GRAPH] --> GT[GlobalTower]
  GT --> RT[Riding Theaters]
  GT --> AP[Airport Pages]
  GT --> R[Routes]
  GT --> D[Destinations]
```

## 4. GlobalTower UI Sections

The GlobalTower component is composed of several distinct UI sections, each responsible for rendering specific aspects of the logistics network.

```mermaid
flowchart TD
  GT[GlobalTower] --> H[Hero]
  GT --> CE[Countries Explorer]
  GT --> DH[Deployment Hubs]
  DH --> DC[DeploymentCard]
  GT --> RT[Riding Theaters]
  RT --> ANC[AdventureNetworkCard]
  GT --> FR[Featured Routes]
```

## 5. Riding Theater Layer

Riding Theaters (Clusters) group routes, destinations, and countries logically around a central airport hub, forming regional networks.

```mermaid
flowchart TD
  C[Clusters] --> MXP[MXP Network]
  C --> OSL[OSL Network]
  C --> LHR[LHR Network]

  MXP --> R[Routes]
  MXP --> Co[Countries]
  MXP --> Re[Regions]
  MXP --> PD[Preview Destinations]
```

## 6. Airport Layer

Airport routing follows a canonical path, passing the requested code through the template which queries the `GRAPH` directly for connected routes.

```mermaid
flowchart TD
  U[/airport/:code] --> AP[AirportPage]
  AP --> AT[AirportTemplate]
  AT -. reads .-> RBA[GRAPH.routesByAirport]
```

## 7. Full Navigation Graph

The logical hierarchy of navigation from the broadest global view down to a specific destination.

```mermaid
flowchart TD
  GT[GlobalTower] --> RT[Riding Theaters]
  RT --> AH[Airport Hub]
  AH --> R[Routes]
  R --> D[Destination]
```

## 8. Component Dependency Map

This map outlines how high-level page components and their child UI elements depend directly on the central `GRAPH`.

```mermaid
flowchart TD
  G[GRAPH] --> GT[GlobalTower]
  GT --> DC[DeploymentCard]
  GT --> ANC[AdventureNetworkCard]
  GT --> FR[FeaturedRoutes]

  G --> AP[AirportPage]
  AP --> AT[AirportTemplate]

  G --> CAP[CountryAirportPage]
  CAP --> CAG[CountryAirportGrid]

  G --> RP[RoutePage]

  G --> DP[DestinationPage]
```

## 9. Platform Flow

The typical user exploration flow reflects the physical logistics of planning an expedition.

```mermaid
flowchart TD
  GI[Global Infrastructure] --> RN[Regional Network]
  RN --> AH[Airport Hub]
  AH --> R[Route]
  R --> D[Destination]
```
