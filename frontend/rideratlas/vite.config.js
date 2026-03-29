import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // ── Vendor chunks ──
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react-router") || id.includes("/react/")) {
              return "vendor-react";
            }
            if (id.includes("firebase")) {
              return "vendor-firebase";
            }
            if (id.includes("framer-motion")) {
              return "vendor-motion";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            if (id.includes("cytoscape") || id.includes("@react-google-maps")) {
              return "vendor-maps";
            }
          }

          // ── Graph data chunks ──
          // networkGraph.js is the assembler that wires core + patriot + rentals.
          // Keep it in the entry chunk to avoid circular chunk dependencies.
          if (id.includes("/core/network/networkGraph") || id.includes("/core/network/graphHealthCheck")) {
            return undefined;
          }
          // buildRentalGraph.js is only needed from the rentals shard loader.
          // Keep it out of graph-core so rental source data stays off the eager path.
          if (id.includes("/core/network/buildRentalGraph")) {
            return "graph-rentals";
          }
          // graphOverlayShard.js is async-imported — let Rollup split it naturally.
          // Forcing it into graph-core would pull rental formatters into sync path.
          if (id.includes("/core/network/graphOverlayShard")) {
            return "graph-overlay-shard";
          }
          if (id.includes("/core/patriot/")) {
            return "graph-patriot";
          }
          if (id.includes("/core/network/")) {
            return "graph-core";
          }

          // ── Rental data ──
          if (id.includes("/features/rentals/data/") || id.includes("/features/rentals/utils/")) {
            return "graph-rentals";
          }

          // ── Airport data ──
          if (id.includes("/features/airport/data/") || id.includes("/features/airport/network/")) {
            return "graph-core";
          }

          // ── Route/destination data ──
          if (id.includes("/features/routes/data/") || id.includes("/features/rides/rideRegions")) {
            return "graph-core";
          }

          // ── Operator data ──
          if (id.includes("/features/operators/")) {
            return "graph-rentals";
          }
        },
      },
    },
  },
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    hmr: {
      clientPort: 443
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.js"],
    include: ["src/**/*.test.{js,jsx}"],
  },
});
