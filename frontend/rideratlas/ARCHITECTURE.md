# RiderAtlas Frontend Architecture Map

## 1. High-Level Overview

The RiderAtlas frontend is a modern, data-driven web application built with React and Vite. It serves as a logistics and adventure routing system for motorcycle enthusiasts, providing a rich user experience for exploring and planning trips. The platform is designed to be dynamic, with pages and content generated from a set of core data sources.

## 2. Technology Stack

- **Framework:** React
- **Build Tool:** Vite
- **Routing:** React Router
- **Styling:** Tailwind CSS, PostCSS
- **Linting:** ESLint (configuration not present, but likely used)
- **Package Manager:** npm

## 3. Project Structure

The project follows a standard React application structure, with some notable conventions:

- **`src/`**: Contains the main application source code.
- **`src/components/`**: Contains reusable UI components.
- **`src/pages/`**: Contains the top-level page components, which are mapped to routes.
- **`src/features/`**: Contains domain-specific logic, data, and components. This is a key architectural pattern in this project.
- **`src/layouts/`**: Contains layout components that define the overall structure of the pages.
- **`src/lib/` and `src/utils/`**: Contain utility functions and libraries.
- **`scripts/`**: Contains various scripts for data generation, SEO, and other tasks.
- **`public/`**: Contains static assets like images, videos, and the sitemap.
- **`data/`**: Contains raw data files, such as CSVs.

## 4. Data Flow & State Management

The application's data flow is primarily one-way, from data sources to UI components.

**Data Sources:**

- **`src/features/airport/network/airportIndex.js`**: A static index of all airports, containing basic information like code, city, country, and slug.
- **`src/features/routes/data/rideDestinations.js`**: A list of all ride destinations, with details like name, slug, and countries.
- **`src/features/routes/data/generatedRideRoutes.js`**: A large, auto-generated file containing all possible routes between airports and destinations.
- **`src/features/airport/data/staticAirports.js`**: Contains "rich" airport data, including control panel links, recovery options, and other details. This data is merged with the basic airport info from `airportIndex.js`.

**Data Pipeline:**

1.  **Route Generation:** The `scripts/generateRideRoutes.mjs` script combines data from `airportIndex.js` and `rideDestinations.js` to create the `generatedRideRoutes.js` file.
2.  **Route Clustering:** The `src/features/routes/clusterRoutes.js` file contains logic to group routes by airport, creating "adventure networks".
3.  **Route Feeds:** The `src/features/routes/routeFeeds.js` file provides functions to access and filter the route data, with built-in performance limitations.

**State Management:**

- **Local Component State:** Most components manage their own state using React hooks (`useState`, `useEffect`, etc.).
- **URL State:** The application relies heavily on the URL to manage state, with parameters like `:slug`, `:continent`, and `:country` used to fetch and display the correct data.
- **React Context:** `AuthContext.jsx` is present, suggesting that React Context is used for managing authentication state.

## 5. Routing & Page Generation

Routing is handled by `react-router-dom` in `src/App.jsx`. The routes are designed to be dynamic, with pages generated based on URL parameters.

**Key Routes:**

- `/airports`: The global tower, showing all continents.
- `/airports/:continent`: A page for a specific continent, showing countries and airports.
- `/airports/country/:country`: A page for a specific country, showing airports in that country.
- `/airport/:slug`: The "Arrival OS" page for a specific airport, providing detailed information and tools.
- `/route/:slug`: A page for a specific ride route.
- `/rides/:region`: A page for a specific riding region.

## 6. Component Architecture

The application uses a component-based architecture, with a clear separation of concerns between components, pages, and features.

- **Smart and Dumb Components:** The project seems to follow the smart/dumb component pattern, with page components (`src/pages/`) responsible for fetching data and handling logic, and UI components (`src/components/`) responsible for rendering the UI.
- **Feature-Based Structure:** The `src/features/` directory is a good example of a feature-based structure, where all the code related to a specific feature (e.g., airports, routes) is co-located.
- **Orphan Components:** The analysis revealed a large number of orphan components, suggesting a need for code cleanup.

## 7. Styling

- **Tailwind CSS:** The project uses Tailwind CSS for utility-first styling.
- **PostCSS:** PostCSS is used for processing the CSS, including autoprefixing.
- **CSS Modules:** Some components have their own `.css` files (e.g., `AchievementsBoard.css`), suggesting the use of CSS Modules for component-specific styles.

## 8. Scripts & Build Process

- **Vite:** The project uses Vite for development and building.
- **npm Scripts:** The `package.json` file likely contains scripts for starting the development server, building the project, and running other tasks.
- **Custom Scripts:** The `scripts/` directory contains custom scripts for various tasks, including:
  - `generateRideRoutes.mjs`: Generates the main route data file.
  - `generateSitemap.mjs`: Generates the `sitemap.xml` file for SEO.
  - Various data import/export scripts.
- **Build Health:** The analysis identified some minor build health issues, such as inconsistencies in the use of ESM and CommonJS, and invalid imports in the sitemap script.
