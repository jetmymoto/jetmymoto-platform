function pickRentalIndexes(graph) {
  return {
    rentalsByAirport: graph.rentalsByAirport || graph.indexes?.rentalsByAirport || {},
    rentalsByOperator: graph.rentalsByOperator || graph.indexes?.rentalsByOperator || {},
    rentalsByType: graph.rentalsByType || graph.indexes?.rentalsByType || {},
    rentalsByDestination: graph.rentalsByDestination || graph.indexes?.rentalsByDestination || {},
    rentalsByDropoff: graph.rentalsByDropoff || graph.indexes?.rentalsByDropoff || {},
    rentalsByOperatorByAirport: graph.rentalsByOperatorByAirport || graph.indexes?.rentalsByOperatorByAirport || {},
    operatorsByAirport: graph.operatorsByAirport || graph.indexes?.operatorsByAirport || {},
    cheapestByAirport: graph.cheapestByAirport || graph.indexes?.cheapestByAirport || {},
    suitabilityScores: graph.suitabilityScores || graph.indexes?.suitabilityScores || {},
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

export function flattenRentalShard(rentalShard) {
  const rentals = rentalShard?.rentals || {};
  const operators = rentalShard?.operators || {};
  const rentalIndexes = rentalShard?.rentalIndexes || {};

  return {
    rentals,
    operators,
    rentalsByAirport: rentalIndexes.rentalsByAirport || {},
    rentalsByOperator: rentalIndexes.rentalsByOperator || {},
    rentalsByType: rentalIndexes.rentalsByType || {},
    rentalsByDestination: rentalIndexes.rentalsByDestination || {},
    rentalsByDropoff: rentalIndexes.rentalsByDropoff || {},
    rentalsByOperatorByAirport: rentalIndexes.rentalsByOperatorByAirport || {},
    operatorsByAirport: rentalIndexes.operatorsByAirport || {},
    cheapestByAirport: rentalIndexes.cheapestByAirport || {},
    suitabilityScores: rentalIndexes.suitabilityScores || {},
    indexes: {
      rentalsByAirport: rentalIndexes.rentalsByAirport || {},
      rentalsByOperator: rentalIndexes.rentalsByOperator || {},
      rentalsByType: rentalIndexes.rentalsByType || {},
      rentalsByDestination: rentalIndexes.rentalsByDestination || {},
      rentalsByDropoff: rentalIndexes.rentalsByDropoff || {},
      rentalsByOperatorByAirport: rentalIndexes.rentalsByOperatorByAirport || {},
      operatorsByAirport: rentalIndexes.operatorsByAirport || {},
      cheapestByAirport: rentalIndexes.cheapestByAirport || {},
      suitabilityScores: rentalIndexes.suitabilityScores || {},
    },
  };
}

export function mergeCoreGraphWithRentalShard(coreGraph, rentalShard) {
  return {
    ...coreGraph,
    ...flattenRentalShard(rentalShard),
    indexes: {
      ...(coreGraph?.indexes || {}),
      ...flattenRentalShard(rentalShard).indexes,
    },
  };
}

export function createGraphRentalShardLoader(graph = null) {
  return async function loadGraphRentalShard() {
    if (graph) {
      return buildGraphRentalShard(graph);
    }

    const { buildRentalGraph } = await import("./buildRentalGraph.js");
    return buildGraphRentalShard(buildRentalGraph());
  };
}
