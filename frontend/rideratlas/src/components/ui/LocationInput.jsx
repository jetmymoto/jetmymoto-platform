import { useEffect, useRef, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { MapPin } from "lucide-react";

const libraries = ["places"];

export default function LocationInput({ value, onChange, onSelect, placeholder = "Enter location" }) {
  const inputRef = useRef(null);
  const [localValue, setLocalValue] = useState(value || "");

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyAWb65ouQrDfc2Rb8mM19Gfwe6xZM9nrks", 
    libraries,
  });

  // Sync with parent value
  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ["formatted_address", "geometry", "name", "address_components"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      
      if (!place || !place.geometry) {
        // Fallback for manual entry
        if (onSelect) {
            onSelect({
                address: inputRef.current.value,
                lat: null,
                lng: null,
                name: inputRef.current.value
            });
        }
        return;
      }

      const address = place.formatted_address || place.name || "";
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      if (onSelect) {
        onSelect({
          address,
          lat,
          lng,
          name: place.name || address,
        });
      }
    });

    // Prevent form submission on Enter in the autocomplete
    const handleKeyDown = (e) => {
      if (e.key === "Enter") e.preventDefault();
    };
    const inputEl = inputRef.current;
    inputEl.addEventListener("keydown", handleKeyDown);

    return () => {
      window.google.maps.event.clearInstanceListeners(autocomplete);
      inputEl.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLoaded, onSelect]);

  return (
    <div className="relative group">
      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-4 h-4 z-10 pointer-events-none group-focus-within:scale-110 transition-transform" />
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value);
          if (onChange) {
            onChange(e);
          }
        }}
        onBlur={(e) => {
            // Hard fallback if they don't select from list
            if (onSelect && e.target.value && e.target.value !== value) {
                onSelect({
                    address: e.target.value,
                    lat: null,
                    lng: null,
                    name: e.target.value
                });
            }
        }}
        placeholder={placeholder}
        className="w-full bg-zinc-950 border border-white/20 p-4 pl-12 font-mono text-xs uppercase tracking-widest text-white placeholder:text-zinc-800 focus:border-amber-500 outline-none rounded-sm transition-all focus:bg-zinc-900"
      />
      
      {/* Custom dropdown styling for the Google Autocomplete results */}
      <style dangerouslySetInnerHTML={{ __html: `
        .pac-container {
          background-color: #09090b !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-top: none !important;
          font-family: monospace !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5) !important;
          margin-top: -1px !important;
          border-radius: 0 0 4px 4px !important;
        }
        .pac-item {
          border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
          padding: 8px 12px !important;
          color: #a1a1aa !important;
          cursor: pointer !important;
        }
        .pac-item:hover {
          background-color: rgba(245, 158, 11, 0.05) !important;
        }
        .pac-item-query {
          color: #ffffff !important;
          font-size: 11px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
        }
        .pac-matched {
          color: #f59e0b !important;
        }
        .pac-icon {
          display: none !important;
        }
      `}} />
    </div>
  );
}
