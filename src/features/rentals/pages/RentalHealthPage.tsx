import { getRentalRailItemsByAirport } from "../services/rentalAdapter";

const TARGET_AIRPORTS = ["MUC", "MXP", "ALC", "DBV", "OSL"];

export default function RentalHealthPage() {
  const stats = TARGET_AIRPORTS.map(code => {
    const items = getRentalRailItemsByAirport(code);
    const total = items.length;
    const trustedPriceCount = items.filter(i => i.hasTrustedPricing).length;
    const imageCount = items.filter(i => i.imageUrl !== null).length;
    const readyCount = items.filter(i => i.hasTrustedPricing && i.imageUrl !== null).length;

    let status = "BLOCKED";
    if (readyCount > 5 && trustedPriceCount > 0) {
      status = "READY";
    } else if (readyCount >= 1) {
      status = "PARTIAL";
    } else if (total > 0 && trustedPriceCount === 0) {
      status = "BLOCKED";
    }

    return {
      code,
      total,
      trustedPriceCount,
      imageCount,
      readyCount,
      status
    };
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-[var(--atlas-ink)]">Rental Data Readiness Matrix</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Airport</th>
              <th className="border p-2">Total</th>
              <th className="border p-2">Trusted Price</th>
              <th className="border p-2">Images</th>
              <th className="border p-2">Ready</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(s => (
              <tr key={s.code} className="text-center">
                <td className="border p-2 font-bold">{s.code}</td>
                <td className="border p-2">{s.total}</td>
                <td className="border p-2">{s.trustedPriceCount}</td>
                <td className="border p-2">{s.imageCount}</td>
                <td className="border p-2">{s.readyCount}</td>
                <td className={`border p-2 font-bold ${
                  s.status === "READY" ? "text-green-600" :
                  s.status === "PARTIAL" ? "text-yellow-600" :
                  "text-red-600"
                }`}>
                  {s.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
