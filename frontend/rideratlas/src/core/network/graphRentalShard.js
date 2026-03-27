function pickRentalIndexes(graph) {
  return {
    rentalsByAirport: graph.rentalsByAirport || graph.indexes?.rentalsByAirport || {},
    rentalsByOperator: graph.rentalsByOperator || graph.indexes?.rentalsByOperator || {},
    rentalsByType: graph.rentalsByType || graph.indexes?.rentalsByType || {},
    rentalsByDestination: graph.rentalsByDestination || graph.indexes?.rentalsByDestination || {},
  };
}

export function buildGraphRentalShard(graph) {
  return {
    rentals: graph.rentals || {},
    operators: graph.operators || {},
    rentalIndexes: {
      ...pickRentalIndexes(graph),
      allRentalIds: Object.keys(graph.rentals || {}),
    },
  };
}

export function createGraphRentalShardLoader(graph) {
  return async function loadGraphRentalShard() {
    return buildGraphRentalShard(graph);
  };
}