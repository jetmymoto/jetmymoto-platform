import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bike,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  MapPin,
  ArrowRight,
  Info,
} from "lucide-react";
import { readGraphSnapshot } from "@/core/network/networkGraph";
import LocationInput from "@/components/ui/LocationInput";
import BookingSuccess from "@/components/ui/BookingSuccess";
import { API_URL } from "@/config/api";

const trackClick = (evt) => {
  if (import.meta.env.DEV) {
    console.log("[TELEMETRY]", { ...evt, ts: new Date().toISOString() });
  }
};

export default function MotoAirliftBookingForm() {
  const [searchParams] = useSearchParams();
  const graph = readGraphSnapshot();

  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [quoteData, setQuoteData] = useState(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const [formData, setFormData] = useState({
    pickupCountry: "",
    pickupCity: "",
    pickupLat: null,
    pickupLng: null,
    destinationCity: "",
    destinationLat: null,
    destinationLng: null,
    arrivalDate: "",
    contact: "",
    bikes: { small: 0, medium: 0, large: 0 },
    bikeDetails: [],
  });

  const totalBikes = formData.bikes.small + formData.bikes.medium + formData.bikes.large;

  const handleBikeChange = (size, delta) => {
    setFormData((prev) => {
      const newCount = Math.max(0, prev.bikes[size] + delta);
      const newBikes = { ...prev.bikes, [size]: newCount };

      let newDetails = [];
      ["small", "medium", "large"].forEach((cls) => {
        const count = newBikes[cls];
        const existing = prev.bikeDetails.filter((d) => d.class === cls);
        for (let i = 0; i < count; i++) {
          newDetails.push(existing[i] || { class: cls, model: "" });
        }
      });

      return { ...prev, bikes: newBikes, bikeDetails: newDetails };
    });
  };

  const handleDetailChange = (index, value) => {
    setFormData((prev) => {
      const newDetails = [...prev.bikeDetails];
      newDetails[index].model = value;
      return { ...prev, bikeDetails: newDetails };
    });
  };

  const PICKUP_LOCATIONS = useMemo(() => {
    const locations = {};
    const destSlugs = graph.indexes.allDestinationSlugs || [];
    destSlugs.forEach((slug) => {
      const dest = graph.entities.destinations?.[slug];
      if (!dest) return;
      const group = dest.country || dest.continent || "Global";
      if (!locations[group]) locations[group] = [];
      if (!locations[group].includes(dest.name)) {
        locations[group].push(dest.name);
      }
    });
    if (Object.keys(locations).length === 0) {
      locations["Europe"] = ["Munich", "Milan", "Nice", "Geneva", "Dubrovnik", "Malaga"];
    }
    return locations;
  }, [graph]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCurrentUrl(window.location.href);
  }, [searchParams]);

  const handleShare = async () => {
    if (typeof window === "undefined") return;

    const url = currentUrl || window.location.href;
    trackClick({ type: "share_click", url });

    try {
      if (navigator.share) {
        await navigator.share({
          title: "JetMyMoto — MotoAirlift Quote",
          text: "Use this page to request a motorcycle airlift quote.",
          url,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        return;
      }
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    trackClick({ type: "quote_submit", mode: "logistics", ...formData });

    let payload = {
      ...formData,
      requestMode: "logistics",
    };

    async function ensureCoordinates(payload) {
      if (payload.pickupLat && payload.destinationLat) {
        return payload;
      }

      const geocode = async (city) => {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY";
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            city
          )}&key=${apiKey}`
        );
        const data = await res.json();
        const loc = data.results[0]?.geometry?.location;

        return loc || null;
      };

      if (!payload.pickupLat && payload.pickupCity) {
        const loc = await geocode(payload.pickupCity);
        payload.pickupLat = loc?.lat;
        payload.pickupLng = loc?.lng;
      }

      if (!payload.destinationLat && payload.destinationCity) {
        const loc = await geocode(payload.destinationCity);
        payload.destinationLat = loc?.lat;
        payload.destinationLng = loc?.lng;
      }

      return payload;
    }

    payload = await ensureCoordinates(payload);

    try {
      const res = await fetch(`${API_URL}/createMotoQuote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error("Invalid server response");
      }

      if (!res.ok) {
        throw new Error(data?.error || "Request failed");
      }

      if (!data.success) {
        throw new Error(data.error || "Quote failed");
      }

      setBookingRef(data.bookingRef);
      setQuoteData(data.data);
      setSubmitted(true);
    } catch (err) {
      console.error("Submit error:", err);
      alert(err.message || "There was an error submitting your request. Please try again.");
    }
  };

  const mailHref = useMemo(() => {
    const url = currentUrl || "JetMyMoto.com";
    const subject = "JetMyMoto — MotoAirlift Quote";
    const body = `Use this link to request a quote: ${url}`;
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [currentUrl]);

  return (
    <section
      id="booking"
      className="py-32 bg-transparent border-t border-[#574C43]/10 relative transition-colors duration-700"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-amber-500/60 to-transparent" />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-20">
        <div className="mb-12 flex flex-col items-center">
          <div className="font-mono text-amber-500 text-[11px] tracking-[0.4em] uppercase mb-4 italic font-black">
            Start your journey with white-glove motorcycle transport planning.
          </div>
          <h2 className="text-4xl md:text-6xl font-serif font-black italic uppercase text-[#574C43] mb-6">
            Start Your Journey
          </h2>

          <div className="flex items-center gap-4 mt-4">
            <button
              type="button"
              onClick={handleShare}
              className="border border-[#574C43]/12 bg-white shadow-sm hover:border-amber-500/50 transition-all text-[#574C43] px-6 py-3 rounded-sm font-mono text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2"
            >
              Send Link to a Friend <ArrowRight size={14} />
            </button>

            <a
              href={mailHref}
              className="text-zinc-500 hover:text-amber-500 transition-colors font-mono text-[10px] uppercase tracking-widest italic font-bold"
            >
              Email Instead
            </a>
          </div>
        </div>

        <div className="flex justify-center flex-wrap gap-6 md:gap-16 mb-12 text-zinc-500 font-mono text-[10px] uppercase tracking-[0.25em] italic font-bold">
          <span className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-amber-500/80" /> €5M Cargo Coverage
          </span>
          <span className="flex items-center gap-2">
            <MapPin size={14} className="text-amber-500/80" /> GPS Tracked
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-amber-500/80" /> Border Cleared
          </span>
        </div>

        <motion.div
          whileHover={{ scale: 1.005 }}
          className="relative bg-white shadow-sm border border-[#574C43]/10 p-8 md:p-12 rounded-sm text-left"
        >
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="grid md:grid-cols-2 gap-8"
              >
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 italic ml-1 font-bold">
                    Pickup Location
                  </label>
                  <LocationInput
                    value={formData.pickupCity}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, pickupCity: e.target.value }))
                    }
                    onSelect={(place) => {
                      setFormData((p) => ({
                        ...p,
                        pickupCity: place.address,
                        pickupCountry: "Auto",
                        pickupLat: place.lat,
                        pickupLng: place.lng,
                      }));
                      trackClick({
                        type: "pickup_location_selected",
                        value: place.address,
                      });
                    }}
                  />
                  <div className="flex items-center gap-2 pt-2 text-zinc-500">
                    <Info size={12} className="text-amber-500/70" />
                    <span className="font-mono text-[10px] uppercase tracking-widest italic">
                      Start typing to search for a city or region. No precise address required at this stage.
                    </span>
                  </div>
                </div>

                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 italic ml-1 font-bold">
                    Destination
                  </label>
                  <LocationInput
                    placeholder="Where should we deliver your bike?"
                    value={formData.destinationCity}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, destinationCity: e.target.value }))
                    }
                    onSelect={(loc) => {
                      setFormData((prev) => ({
                        ...prev,
                        destinationCity: loc.address,
                        destinationLat: loc.lat,
                        destinationLng: loc.lng,
                      }));
                      trackClick({
                        type: "destination_location_selected",
                        value: loc.address,
                      });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 italic ml-1 font-bold">
                    Arrival Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-4 h-4" />
                    <input
                      type="date"
                      required
                      aria-label="Arrival Date"
                      value={formData.arrivalDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((p) => ({ ...p, arrivalDate: val }));
                        trackClick({ type: "arrival_date_set", value: val });
                      }}
                      className="w-full bg-white border border-[#574C43]/12 p-4 pl-12 font-mono text-xs uppercase tracking-widest text-[#574C43] focus:border-amber-500 outline-none shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-4 md:col-span-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 italic ml-1 font-bold">
                    Transport Class & Quantity
                  </label>
                  {["small", "medium", "large"].map((size) => (
                    <div
                      key={size}
                      className="flex items-center justify-between p-4 bg-white border border-[#574C43]/12 rounded-sm shadow-sm"
                    >
                      <span className="text-[#574C43] capitalize font-black italic font-mono text-xs uppercase tracking-widest">
                        {size} Class
                      </span>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => handleBikeChange(size, -1)}
                          disabled={formData.bikes[size] === 0}
                          className="w-8 h-8 flex items-center justify-center rounded bg-[#F8F8F8] border border-[#574C43]/12 text-zinc-500 hover:text-[#574C43] disabled:opacity-30 disabled:hover:text-zinc-500 transition-all"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-[#574C43] font-mono">
                          {formData.bikes[size]}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleBikeChange(size, 1)}
                          className="w-8 h-8 flex items-center justify-center rounded bg-[#F8F8F8] border border-[#574C43]/12 text-[#574C43] hover:bg-amber-500 hover:border-amber-500 hover:text-black transition-all"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}

                  {totalBikes > 0 && (
                    <div className="text-[10px] text-amber-500 font-mono italic flex items-center gap-2 pt-2 font-black uppercase tracking-widest">
                      <CheckCircle2 size={12} />
                      {totalBikes} bikes selected:
                      {[
                        formData.bikes.large > 0 && ` ${formData.bikes.large} large`,
                        formData.bikes.medium > 0 && ` ${formData.bikes.medium} medium`,
                        formData.bikes.small > 0 && ` ${formData.bikes.small} small`,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  )}
                </div>

                {totalBikes > 0 && (
                  <div className="space-y-4 md:col-span-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 italic ml-1 font-bold flex items-center gap-2">
                      Specific Models <span className="text-zinc-400">(Optional)</span>
                    </label>
                    {formData.bikeDetails.map((detail, idx) => {
                      const numberInClass = formData.bikeDetails.filter(
                        (d, i) => d.class === detail.class && i <= idx
                      ).length;
                      return (
                        <div key={idx} className="flex gap-3 relative">
                          <div className="w-32 px-3 py-4 bg-white border border-[#574C43]/12 rounded-sm text-[10px] text-zinc-500 font-mono flex items-center justify-center capitalize font-bold tracking-widest italic shadow-sm">
                            {detail.class} #{numberInClass}
                          </div>
                          <Bike className="absolute left-[9.5rem] top-1/2 -translate-y-1/2 text-amber-500/50 w-4 h-4 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="E.G. GS 1250, PANIGALE..."
                            value={detail.model}
                            onChange={(e) => handleDetailChange(idx, e.target.value)}
                            className="flex-1 bg-white border border-[#574C43]/12 p-4 pl-12 font-mono text-xs uppercase tracking-widest text-[#574C43] placeholder:text-zinc-400 focus:border-amber-500 outline-none rounded-sm shadow-sm"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="space-y-2 md:col-span-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 italic ml-1 font-bold">
                    Travel Essentials
                  </label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-4 h-4" />
                    <input
                      type="text"
                      required
                      placeholder="EMAIL / PHONE"
                      value={formData.contact}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((p) => ({ ...p, contact: val }));
                      }}
                      className="w-full bg-white border border-[#574C43]/12 p-4 pl-12 font-mono text-xs uppercase tracking-widest text-[#574C43] placeholder:text-zinc-400 focus:border-amber-500 outline-none shadow-sm"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 p-5 border border-amber-500/40 bg-amber-500/5 rounded flex flex-wrap gap-6 justify-between items-center">
                  <div className="flex gap-8">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-black">
                        Inventory
                      </span>
                      <span className="text-[12px] font-mono text-[#574C43] uppercase font-black tracking-widest italic">
                        {totalBikes} {totalBikes === 1 ? "Machine" : "Machines"}
                      </span>
                    </div>

                    <div className="flex flex-col border-l border-white/10 pl-6">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-black">
                        Origin
                      </span>
                      <span className="text-[12px] font-mono text-amber-500 uppercase font-black tracking-widest italic">
                        {formData.pickupCity || "---"}
                      </span>
                    </div>

                    <div className="flex flex-col border-l border-white/10 pl-6">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-black">
                        Destination
                      </span>
                      <span className="text-[12px] font-mono text-amber-500 uppercase font-black tracking-widest italic">
                        {formData.destinationCity || "---"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 pt-4">
                  <button
                    type="submit"
                    disabled={totalBikes === 0}
                    className="w-full bg-amber-500 text-[#050505] py-6 font-mono font-black uppercase tracking-[0.3em] text-base hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed transition-all flex flex-col items-center justify-center gap-1 shadow-[0_10px_40px_rgba(245,158,11,0.2)] disabled:shadow-none"
                  >
                    <span className="flex items-center gap-3">
                      Secure Your Transport <ArrowRight size={20} />
                    </span>

                    {totalBikes > 1 && (
                      <span className="text-[10px] uppercase tracking-widest italic font-black">
                        Fleet consolidation pricing applied.
                      </span>
                    )}
                  </button>

                  <p className="mt-4 text-center text-[10px] font-mono uppercase tracking-widest text-zinc-500 italic font-bold">
                    No payment required. Quote confirmation only.
                  </p>
                </div>
              </motion.form>
            ) : (
              <BookingSuccess bookingRef={bookingRef} email={formData.contact} quoteData={quoteData} />
            )}
          </AnimatePresence>
        </motion.div>

        <div className="mt-8 flex items-center justify-center gap-2">
          <ShieldCheck size={14} className="text-zinc-500" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 italic font-bold">
            Encrypted Secure Uplink • Verified Logistics Provider
          </span>
        </div>
      </div>
    </section>
  );
}
