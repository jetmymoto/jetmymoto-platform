import fs from 'fs';
let content = fs.readFileSync('frontend/rideratlas/src/features/rentals/components/RentalGrid.jsx', 'utf8');

// 1. Add selectedBrand to state
content = content.replace(
  'const [selectedOperator, setSelectedOperator] = useState("all");',
  'const [selectedOperator, setSelectedOperator] = useState("all");\n  const [selectedBrand, setSelectedBrand] = useState("all");'
);

// 2. Add brandOptions useMemo
const brandOptionsCode = `
  const brandOptions = useMemo(() => {
    const brands = new Set(rawRentals.map((rental) => rental.brand || rental.make).filter(Boolean));
    return ["all", ...Array.from(brands).sort()];
  }, [rawRentals]);

  const operatorOptions = useMemo(() =>`;

content = content.replace('  const operatorOptions = useMemo(() =>', brandOptionsCode);

// 3. Update filteredRentals logic
const filteredRentalsUpdate = `    if (selectedBrand !== "all") {
      result = result.filter((rental) => {
        const b = rental.brand || rental.make;
        return b === selectedBrand;
      });
    }
    return result;
  }, [rawRentals, selectedIntent, selectedOperator, selectedBrand]);`;

content = content.replace(
  '    return result;\n  }, [rawRentals, selectedIntent, selectedOperator]);',
  filteredRentalsUpdate
);

// 4. Update UI - Add Brand Selector before Operator Selector
const brandUI = `
          {/* Brand Selection */}
          {brandOptions.length > 2 && (
            <>
              <div className="text-[10px] tracking-[0.4em] uppercase text-white/30 mt-12 mb-6 font-mono font-bold flex items-center gap-4 justify-center">
                <div className="w-4 h-[1px] bg-white/20"></div>
                Manufacturer
                <div className="w-4 h-[1px] bg-white/20"></div>
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center">
                {brandOptions.map((brand) => {
                  const isActive = selectedBrand === brand;
                  const label = brand === "all" ? "All Brands" : brand;

                  return (
                    <button
                      key={brand}
                      onClick={() => setSelectedBrand(brand)}
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
          )}

          {/* Operator Selection */}`;

content = content.replace('{/* Operator Selection */}', brandUI);

fs.writeFileSync('frontend/rideratlas/src/features/rentals/components/RentalGrid.jsx', content);
