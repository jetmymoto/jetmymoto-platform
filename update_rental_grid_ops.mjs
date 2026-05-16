import fs from 'fs';
let content = fs.readFileSync('frontend/rideratlas/src/features/rentals/components/RentalGrid.jsx', 'utf8');

// We need to add selectedOperator to state
content = content.replace(
  'const [selectedIntent, setSelectedIntent] = useState("all");',
  'const [selectedIntent, setSelectedIntent] = useState("all");\n  const [selectedOperator, setSelectedOperator] = useState("all");'
);

// We need to add operators to the destructuring of rentalsShard
content = content.replace(
  'const rentalsMap = rentalsShard?.rentals || {};',
  'const rentalsMap = rentalsShard?.rentals || {};\n  const operators = rentalsShard?.operators || {};'
);

// Update filteredRentals
const newFilteredRentals = `  const operatorOptions = useMemo(() => {
    const ops = new Set(rawRentals.map((rental) => rental.operatorId || rental.operator).filter(Boolean));
    return ["all", ...Array.from(ops).sort()];
  }, [rawRentals]);

  const filteredRentals = useMemo(() => {
    let result = rawRentals;
    if (selectedIntent !== "all") {
      result = result.filter((rental) => {
        const category = getRentalCategoryLabel(rental)?.toLowerCase() || "other";
        return category === selectedIntent;
      });
    }
    if (selectedOperator !== "all") {
      result = result.filter((rental) => {
        const op = rental.operatorId || rental.operator;
        return op === selectedOperator;
      });
    }
    return result;
  }, [rawRentals, selectedIntent, selectedOperator]);`;

content = content.replace(
  /const filteredRentals = useMemo\(\(\) => \{[\s\S]*?\}, \[rawRentals, selectedIntent\]\);/,
  newFilteredRentals
);

// Now the UI for the operators
const operatorUI = `          <div className="flex flex-wrap gap-4 justify-center">
            {filterOptions.map((intent) => {
              const isActive = selectedIntent === intent;
              const label = intent === "all" ? "All Machines" : intent;

              return (
                <button
                  key={intent}
                  onClick={() => setSelectedIntent(intent)}
                  className={\`font-mono text-[11px] tracking-[0.2em] uppercase px-5 py-2.5 transition-all duration-300 border \${
                    isActive
                      ? "bg-[#CDA755] text-[#050505] border-[#CDA755] font-bold shadow-[0_0_20px_rgba(205,167,85,0.4)]"
                      : "border-[#CDA755]/20 text-white/50 hover:text-[#CDA755] hover:border-[#CDA755]/60"
                  }\`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Operator Selection */}
          {operatorOptions.length > 2 && (
            <>
              <div className="text-[10px] tracking-[0.4em] uppercase text-white/30 mt-12 mb-6 font-mono font-bold flex items-center gap-4">
                <div className="w-4 h-[1px] bg-white/20"></div>
                Operator Assignment
                <div className="w-4 h-[1px] bg-white/20"></div>
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center">
                {operatorOptions.map((opId) => {
                  const isActive = selectedOperator === opId;
                  const label = opId === "all" ? "All Operators" : operators?.[opId]?.name || opId;

                  return (
                    <button
                      key={opId}
                      onClick={() => setSelectedOperator(opId)}
                      className={\`font-mono text-[10px] tracking-[0.2em] uppercase px-4 py-2 transition-all duration-300 border \${
                        isActive
                          ? "bg-white/10 text-white border-white/20 font-bold"
                          : "border-white/5 text-white/30 hover:text-white hover:border-white/10 bg-[#050505]"
                      }\`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </>
          )}`;

content = content.replace(
  /<div className="flex flex-wrap gap-4 justify-center">\s*\{filterOptions\.map\(\(intent\) => \{[\s\S]*?\}\)\}\s*<\/div>/,
  operatorUI
);

fs.writeFileSync('frontend/rideratlas/src/features/rentals/components/RentalGrid.jsx', content);
