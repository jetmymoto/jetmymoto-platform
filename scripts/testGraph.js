async function test() {
  const { buildNetworkGraph } = await import('../frontend/rideratlas/src/core/network/buildNetworkGraph.js');
  const { buildRentalGraph } = await import('../frontend/rideratlas/src/core/network/buildRentalGraph.js');
  const net = buildNetworkGraph();
  const rent = buildRentalGraph();
  console.log('Airports:', Object.keys(net.airports || {}).length);
  console.log('Routes:', Object.keys(net.routes || {}).length);
  console.log('Rentals:', Object.keys(rent.rentals || {}).length);
}
test();
