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
            if (id.includes("mapbox-gl") || id.includes("cytoscape") || id.includes("@react-google-maps")) {
              return "vendor-maps";
            }
          }

          if (id.includes("/src/features/poi/shards/")) {
            const match = id.match(/\/shards\/([a-z0-9]+|misc)\.json$/);
            return match ? `graph-poi-${match[1]}` : "graph-poi-data";
          }

          if (id.includes("/src/features/poi/poiFilteredShard")) {
            return "graph-poi-runtime";
          }

          if (id.includes("/src/features/poi/poiFilteredBucketIndex")) {
            return "graph-poi-runtime";
          }

          if (id.includes("/core/network/buildRentalGraph")) {
            return "graph-rentals";
          }

          if (id.includes("/core/network/graphOverlayShard")) {
            return "graph-overlay-shard";
          }

          if (id.includes("/core/patriot/")) {
            return "graph-patriot";
          }

          if (id.includes("/core/visual/")) {
            return "graph-visual";
          }

          if (id.includes("/features/rentals/data/") || id.includes("/features/rentals/utils/")) {
            return "graph-rentals";
          }

          if (id.includes("/features/airport/data/") || id.includes("/features/airport/network/")) {
            return "graph-airports";
          }

          if (id.includes("/features/routes/data/") || id.includes("/features/rides/rideRegions")) {
            return "graph-routes";
          }

          if (id.includes("/core/network/")) {
            return "graph-runtime";
          }

          if (id.includes("/pages/admin/") || id.includes("/pages/AdminDashboard") || id.includes("/pages/AdminPostersPage")) {
            return "admin";
          }

          if (id.includes("/pages/Mission") || id.includes("/pages/PoolPage") || id.includes("/pages/HangarPage")) {
            return "mission-tools";
          }

          return undefined;
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
