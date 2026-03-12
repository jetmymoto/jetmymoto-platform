import React, { useState } from "react";
import { airportConfig as initialAirportConfig } from "../../features/airport/data/airportConfig.generated.js";

const STATUS_OPTIONS = ["PIPELINE", "VALIDATION", "ACTIVE", "PAUSED", "DISABLED"];

export default function NetworkPanel() {
  const [airports, setAirports] = useState(initialAirportConfig || []);

  const handleInputChange = (code, field, value) => {
    setAirports(prev =>
      (prev || []).map(airport =>
        airport.code === code ? { ...airport, [field]: value } : airport
      )
    );
  };

  if (!airports || airports.length === 0) {
    return (
      <div className="text-white p-6">
        No airports loaded.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-white">Airport Network</h2>

      <div className="space-y-4">
        {airports.map(airport => (
          <div
            key={airport.code}
            className="bg-[#0a0a0a] border border-white/10 p-6 rounded-lg"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black uppercase text-amber-500">
                  {airport.name} ({airport.code})
                </h3>

                <p className="font-mono text-xs text-gray-500">
                  {airport.country || "-"} / {airport.region || "-"} /{" "}
                  {airport.theater || "-"}
                </p>
              </div>

              <select
                value={airport.status || "PIPELINE"}
                onChange={e =>
                  handleInputChange(airport.code, "status", e.target.value)
                }
                className="bg-black border border-white/20 p-2 rounded-md font-mono text-xs"
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Core Details */}
              <div className="space-y-4">
                <InputField
                  label="Name"
                  value={airport.name || ""}
                  onChange={e =>
                    handleInputChange(airport.code, "name", e.target.value)
                  }
                />

                <InputField
                  label="Country"
                  value={airport.country || ""}
                  onChange={e =>
                    handleInputChange(airport.code, "country", e.target.value)
                  }
                />

                <InputField
                  label="Region"
                  value={airport.region || ""}
                  onChange={e =>
                    handleInputChange(airport.code, "region", e.target.value)
                  }
                />

                <InputField
                  label="Theater"
                  value={airport.theater || ""}
                  onChange={e =>
                    handleInputChange(airport.code, "theater", e.target.value)
                  }
                />
              </div>

              {/* Activation */}
              <div className="space-y-4">
                <InputField
                  label="Tier"
                  value={airport.tier || ""}
                  onChange={e =>
                    handleInputChange(airport.code, "tier", e.target.value)
                  }
                />

                <InputField
                  label="Corridor"
                  value={airport.corridor || ""}
                  onChange={e =>
                    handleInputChange(airport.code, "corridor", e.target.value)
                  }
                />

                <InputField
                  label="Type"
                  value={airport.type || ""}
                  onChange={e =>
                    handleInputChange(airport.code, "type", e.target.value)
                  }
                />
              </div>

              {/* Feature Flags */}
              <div className="space-y-4 bg-white/5 p-4 border border-white/10 rounded-md">
                <CheckboxField
                  label="Planner Enabled"
                  checked={airport.plannerEnabled || false}
                  onChange={e =>
                    handleInputChange(
                      airport.code,
                      "plannerEnabled",
                      e.target.checked
                    )
                  }
                />

                <CheckboxField
                  label="Booking Enabled"
                  checked={airport.bookingEnabled || false}
                  onChange={e =>
                    handleInputChange(
                      airport.code,
                      "bookingEnabled",
                      e.target.checked
                    )
                  }
                />

                <CheckboxField
                  label="SEO Enabled"
                  checked={airport.seoEnabled || false}
                  onChange={e =>
                    handleInputChange(
                      airport.code,
                      "seoEnabled",
                      e.target.checked
                    )
                  }
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() =>
                  alert("Save functionality not implemented yet.")
                }
                className="bg-amber-500 text-black px-6 py-2 font-bold uppercase text-xs hover:bg-white transition-all"
              >
                Save
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const InputField = ({ label, value, onChange }) => (
  <div>
    <label className="block font-mono text-[10px] text-gray-400 uppercase mb-1">
      {label}
    </label>

    <input
      type="text"
      value={value}
      onChange={onChange}
      className="w-full bg-black border border-white/20 p-2 rounded-md text-sm"
    />
  </div>
);

const CheckboxField = ({ label, checked, onChange }) => (
  <label className="flex items-center space-x-3 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="form-checkbox h-5 w-5 bg-black border-white/20 rounded text-amber-500 focus:ring-amber-500"
    />

    <span className="text-sm font-medium">{label}</span>
  </label>
);
