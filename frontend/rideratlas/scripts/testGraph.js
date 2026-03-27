import { createServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rideratlasRoot = path.resolve(__dirname, "..");

const server = await createServer({
  configFile: path.resolve(rideratlasRoot, "vite.config.js"),
  root: rideratlasRoot,
  server: {
    middlewareMode: true,
    hmr: false
  },
  appType: "custom"
});

try {
  const { GRAPH } = await server.ssrLoadModule("/src/core/network/networkGraph.js");
  const berIds = GRAPH?.rentalsByAirport?.BER || [];

  console.log("GRAPH.rentalsByAirport.BER", berIds);
  console.log("BER rental count", berIds.length);
  console.log(
    "BER rentals",
    berIds.map((id) => {
      const rental = GRAPH?.rentals?.[id];
      return {
        id,
        airport: rental?.airport,
        operator: rental?.operator
      };
    })
  );
} finally {
  await server.close();
}
