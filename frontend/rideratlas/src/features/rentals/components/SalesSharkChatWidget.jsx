import { generateExperienceUpsell } from "../utils/experienceEngine";
import { generateItinerary } from "../utils/itineraryEngine";
import { generateMissionCopy } from "../utils/missionCopyEngine";
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  createCheckoutSession,
  createRentalReservation,
} from "@/services/bookingService";
import { buildRentalLegalAcknowledgement } from "@/features/rentals/utils/legalAcknowledgement";
import { GRAPH } from "@/core/network/networkGraph";

const FLOW = ["hook", "dates", "insurance", "identity", "confirm", "success"];
const BROKER_RESERVATION_FEE_CENTS = 5000;
const BROKER_RESERVATION_FEE_LABEL = "EUR 50";
const TEMP_HOLD_COPY = "This machine is being held for a limited window while we resolve this.";

const initialData = {
  pickupDate: "",
  returnDate: "",
  pickupTime: "10:00",
  insurance: "",
  name: "",
  email: "",
  notes: "",
};

function validateIdentity({ name, email }) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return name.trim().length > 2 && emailRegex.test(email);
}

export default function SalesSharkChatWidget({ rental, operator, airport }) {
  const [missionCopy, setMissionCopy] = useState(null);
  const category = rental?.category || "adventure";
  const machineName = rental?.machineLabel || rental?.name || "Tactical Hardware";
  const airportCode = rental?.airportCode || rental?.airport || airport?.code || "the hub";
  const resolvedOperator = operator || GRAPH?.operators?.[rental?.operator] || GRAPH?.operators?.[rental?.operatorId];
  
  const operatorName = resolvedOperator?.name || rental?.operator || "The verified operator";
  const operatorId = resolvedOperator?.id || rental?.operatorId || rental?.operator || "";
  const legalAcknowledgement = buildRentalLegalAcknowledgement(resolvedOperator, {
    brokerFeeLabel: BROKER_RESERVATION_FEE_LABEL,
  });
  
  const topUseCase = category.toLowerCase().includes("adventure") 
    ? "mixed terrain and high-altitude switchbacks" 
    : category.toLowerCase().includes("touring") 
      ? "long-range endurance and paved mountain passes" 
      : "dynamic regional deployment";

  const hookMessage = missionCopy?.hook || `Ah, the ${machineName}.\nStaged at ${airportCode}, configured for ${category.toLowerCase()} deployment.\n\nThis is the right class of machine for ${topUseCase}.\n\nReady to lock your window?`;



  useEffect(() => {
    const pDate = data.pickupDate ? new Date(data.pickupDate) : new Date();
    const rDate = data.returnDate ? new Date(data.returnDate) : new Date(pDate.getTime() + 86400000 * 3);
    const durationDays = Math.ceil((rDate - pDate) / (1000 * 60 * 60 * 24)) || 3;

    generateMissionCopy({
      machineName,
      category,
      airportCode,
      airportCity: rental?.airportCity || airportCode,
      operatorName,
      terrainType: category.toLowerCase().includes("adventure") ? "mixed terrain" : "paved passes",
      durationDays
    }).then(setMissionCopy);
  }, [rental]);

  const [stepIdx, setStepIdx] = useState(0);
  const [data, setData] = useState(initialData);
  const [messages, setMessages] = useState([
    { from: "ai", text: hookMessage },
  ]);

  useEffect(() => {
    if (missionCopy?.hook && messages.length === 1 && messages[0].text !== missionCopy.hook) {
      setMessages([{ from: "ai", text: missionCopy.hook }]);
    }
  }, [missionCopy, messages.length]);
  const [input, setInput] = useState({ name: "", email: "" });
  const [error, setError] = useState("");
  const [experienceData, setExperienceData] = useState(null);
  const [heldBookingRef, setHeldBookingRef] = useState("");
  const [recoveryState, setRecoveryState] = useState(null);
  const [successMode, setSuccessMode] = useState("payment");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  
  const step = FLOW[stepIdx];

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial Value Stack Auto-Push
  useEffect(() => {
    if (stepIdx === 0 && messages.length === 1) {
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, {
          from: "ai",
          text: `${operatorName} has this unit staged and verified.\n\nMost riders deploy this setup for:\n• Alpine passes\n• Long-range touring\n• Mixed terrain missions\n\nYou're looking at the right platform.\n\nThis is one of the strongest setups available in this hub right now.`
        }]);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [stepIdx, messages.length, operatorName]);

  function pushAIMessage(text, delay = 400) {
    setTimeout(() => {
      setMessages((msgs) => [...msgs, { from: "ai", text }]);
    }, delay);
  }

  const handleHook = (choice) => {
    setMessages((msgs) => [...msgs, { from: "user", text: choice }]);
    pushAIMessage("Let’s define your deployment window.\n\nPick your exact dates — I’ll align the rest.", 600);
    setStepIdx(1);
  };

  const handleDates = (field, value) => {
    setData((d) => ({ ...d, [field]: value }));
    setError("");
    setRecoveryState(null);
  };

  const handleDatesNext = async () => {
    if (!data.pickupDate || !data.returnDate) {
      setError("Please select both pickup and return dates.");
      return;
    }
    
    if (new Date(data.returnDate) < new Date(data.pickupDate)) {
      setMessages((msgs) => [...msgs, { from: "ai", text: "Commander, your return date cannot be before your pickup date. Please adjust your mission window." }]);
      return;
    }

    setMessages((msgs) => [...msgs, { from: "user", text: `Window locked: ${data.pickupDate} → ${data.returnDate}` }]);
    
    const pDate = new Date(data.pickupDate);
    const rDate = new Date(data.returnDate);
    const days = Math.max(1, Math.ceil((rDate - pDate) / (1000 * 60 * 60 * 24)));
    
    // Fetch Itinerary
    
    const experience = await generateExperienceUpsell({
      airportCode,
      airportCity: rental?.airportCity || airportCode,
      durationDays: days,
      category,
      terrainType: topUseCase,
      machineName
    });
    setExperienceData(experience);

    // Fetch Itinerary
    const itinerary = await generateItinerary({
      airportCode,
      airportCity: rental?.airportCity || airportCode,
      durationDays: days,
      category,
      terrainType: topUseCase
    });

    let baseDelay = 800;
    pushAIMessage("Based on your window, here’s what this ride actually looks like:", baseDelay);
    
    baseDelay += 1200;
    setTimeout(() => {
      setMessages((msgs) => [...msgs, { from: "itinerary", payload: itinerary }]);
    }, baseDelay);
    
    baseDelay += 800;

    if (experience?.routeHighlight) {
      setTimeout(() => {
        setMessages((msgs) => [...msgs, {
          from: "experience",
          text: experience.routeHighlight.description,
          payload: { title: experience.routeHighlight.title, category: "Route Intelligence" }
        }]);
      }, baseDelay);
      baseDelay += 1800;
    }

    if (days <= 4) {
      pushAIMessage(
        missionCopy?.durationAdvice ||
          "This window works.\n\nBut extending by 1–2 days unlocks the full terrain profile this machine is built for.",
        baseDelay,
      );
      baseDelay += 1800;
    } else {
      pushAIMessage(
        "This window works.\n\nYou are inside the full terrain profile this machine is built for.",
        baseDelay,
      );
      baseDelay += 1500;
    }

    pushAIMessage(`Conditions in this region can shift fast.\n\nMost riders choose Premium to eliminate deposit risk and ride without hesitation.`, baseDelay);
    pushAIMessage("Select your coverage level.", baseDelay + 2000);
    setStepIdx(2);
  };

  const handleInsurance = (option) => {
    setData((d) => ({ ...d, insurance: option }));
    setMessages((msgs) => [...msgs, { from: "user", text: option.charAt(0).toUpperCase() + option.slice(1) }]);
    let delay = 600;
    if (experienceData?.hotelSuggestion) {
      setTimeout(() => {
        setMessages((msgs) => [...msgs, {
          from: "experience",
          text: experienceData.hotelSuggestion.description,
          payload: { title: experienceData.hotelSuggestion.title, category: "Staging Area" }
        }]);
      }, delay);
      delay += 1800;
    } else if (experienceData?.bikerSpot) {
      setTimeout(() => {
        setMessages((msgs) => [...msgs, {
          from: "experience",
          text: experienceData.bikerSpot.description,
          payload: { title: experienceData.bikerSpot.title, category: "Known Checkpoint" }
        }]);
      }, delay);
      delay += 1800;
    }
    pushAIMessage("I’ll lock this under your name.\n\nWho should I assign this reservation to?", delay);
    setStepIdx(3);
  };

  const handleIdentityChange = (field, value) => {
    setInput((i) => ({ ...i, [field]: value }));
    setError("");
    setRecoveryState(null);
  };

  const handleIdentityNext = () => {
    if (!validateIdentity(input)) {
      setError("Please enter a valid name and email to continue.");
      return;
    }
    setData((d) => ({ ...d, name: input.name, email: input.email }));
    setMessages((msgs) => [...msgs, { from: "user", text: `Name: ${input.name}\nEmail: ${input.email}` }]);
    
    pushAIMessage(`Everything is aligned.\n\nMachine: ${machineName}\nOperator: ${operatorName}\nWindow: ${data.pickupDate} → ${data.returnDate}\n\nThis unit will be reserved under your name.`, 800);
    pushAIMessage(
      `${legalAcknowledgement.acknowledgedSecurityDeposit}\n${legalAcknowledgement.acknowledgedCancellationPolicy}\n\n${legalAcknowledgement.acknowledgedReservationFee}`,
      2100,
    );
    let finalDelay = 4200;
    if (experienceData?.restaurantSuggestion) {
      setTimeout(() => {
        setMessages((msgs) => [...msgs, {
          from: "experience",
          text: experienceData.restaurantSuggestion.description,
          payload: { title: experienceData.restaurantSuggestion.title, category: "Rider Outpost" }
        }]);
      }, finalDelay);
      finalDelay += 1800;
    }
    pushAIMessage(
      `Unreserved machines in this hub are often allocated within hours.\n\nIf this mission continues beyond this hub, we can reposition your machine to your next destination without breaking your ride.\n\nLock this machine now?`,
      finalDelay,
    );

    setStepIdx(4);
  };

  const initiateCheckout = async (bookingRef, email) => {
    const session = await createCheckoutSession({
      bookingRef,
      email,
      amountCents: BROKER_RESERVATION_FEE_CENTS,
      currency: "eur",
      productName: "JetMyMoto Tactical Hardware Priority Reservation",
      productDescription: `${machineName} @ ${airportCode}`,
    });

    if (session?.url) {
      window.location.href = session.url;
      return;
    }

    throw new Error("No checkout URL returned");
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    setRecoveryState(null);
    setSuccessMode("payment");
    let nextBookingRef = heldBookingRef || "";
    try {
      setMessages((msgs) => [...msgs, { from: "user", text: "Lock This Machine Now" }]);

      const reservationPayload = {
        rentalId: rental?.id || rental?.slug || "",
        rentalSlug: rental?.slug || "",
        airportCode,
        machineName,
        operatorName,
        operatorId: operatorId || undefined,
        pickupDate: data.pickupDate,
        returnDate: data.returnDate,
        contact: {
          email: data.email,
          name: data.name || undefined,
        },
        riderName: data.name || undefined,
        insuranceOption: data.insurance || "none",
        pickupTime: data.pickupTime || undefined,
        notes: data.notes || undefined,
        legalAcknowledgement,
      };

      const reservation = await createRentalReservation(reservationPayload);
      nextBookingRef = reservation.bookingRef;
      setHeldBookingRef(reservation.bookingRef);

      await initiateCheckout(reservation.bookingRef, data.email);
    } catch (e) {
      const linkedEmail = data.email || input.email || "";
      setRecoveryState({
        bookingRef: nextBookingRef,
        linkedEmail,
      });
      setMessages((msgs) => [
        ...msgs,
        {
          from: "ai",
          text: `Transmission interrupted.\n\nYour reservation signal was received, but the payment channel did not fully confirm.\n\nThis unit is temporarily held under your name while we re-establish the uplink.\n\n${TEMP_HOLD_COPY}`,
        },
        ...(linkedEmail
          ? [
              {
                from: "ai",
                text: `We've already linked this reservation to: ${linkedEmail}`,
              },
            ]
          : []),
        {
          from: "ai",
          text: "You have two options:\n\n• Retry secure uplink now\n• Let operations finalize this manually (you'll be contacted shortly)",
        },
      ]);
      setLoading(false);
    }
  };

  const handleRetryUplink = async () => {
    setLoading(true);
    setError("");
    setRecoveryState(null);
    setMessages((msgs) => [...msgs, { from: "user", text: "Retry Secure Uplink" }]);

    try {
      if (heldBookingRef) {
        await initiateCheckout(heldBookingRef, data.email || recoveryState?.linkedEmail || "");
      } else {
        await handleConfirm();
      }
    } catch (e) {
      setMessages((msgs) => [
        ...msgs,
        {
          from: "ai",
          text: `Transmission still unstable.\n\n${TEMP_HOLD_COPY}`,
        },
      ]);
      setLoading(false);
    }
  };

  const handleOpsConfirmation = () => {
    const linkedEmail = recoveryState?.linkedEmail || data.email || input.email || "";
    const bookingRef = heldBookingRef || recoveryState?.bookingRef || "";

    setMessages((msgs) => [
      ...msgs,
      { from: "user", text: "Continue via Ops Confirmation" },
      {
        from: "ai",
        text: `Operations has the hold.\n\n${TEMP_HOLD_COPY}\n\n${
          linkedEmail
            ? `We have already linked it to ${linkedEmail}.`
            : "Operations will use your reservation details already on file."
        }`,
      },
      {
        from: "ai",
        text: bookingRef
          ? `Booking reference held: ${bookingRef}\n\nOps will finalize this manually and contact you shortly.`
          : "Ops will finalize this manually and contact you shortly.",
      },
    ]);
    setSuccessMode("ops");
    setRecoveryState(null);
    setStepIdx(5);
    setLoading(false);
  };

  let controlPanel = null;
  if (step === "hook") {
    controlPanel = (
      <div className="flex gap-4">
        <button className="btn-accent w-full" onClick={() => handleHook("Let's do it")}>Initiate Briefing</button>
        <button className="btn-panel w-full" onClick={() => handleHook("I have a question")}>Request Intel</button>
      </div>
    );
  } else if (step === "dates") {
    controlPanel = (
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mb-1 block font-bold">Pickup Date</label>
            <input
              type="date"
              className="input w-full bg-[#050505] border border-white/10 p-3 rounded-sm font-mono text-[10px] text-white focus:border-[#CDA755] outline-none transition-colors"
              value={data.pickupDate}
              onChange={(e) => handleDates("pickupDate", e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mb-1 block font-bold">Return Date</label>
            <input
              type="date"
              className="input w-full bg-[#050505] border border-white/10 p-3 rounded-sm font-mono text-[10px] text-white focus:border-[#CDA755] outline-none transition-colors"
              value={data.returnDate}
              onChange={(e) => handleDates("returnDate", e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mb-1 block font-bold">Pickup Time</label>
          <select
            className="input w-full bg-[#050505] border border-white/10 p-3 rounded-sm font-mono text-[10px] text-white focus:border-[#CDA755] outline-none transition-colors appearance-none"
            value={data.pickupTime}
            onChange={(e) => handleDates("pickupTime", e.target.value)}
          >
            {Array.from({ length: 19 }, (_, i) => {
              const hour = 9 + Math.floor(i / 2);
              const min = i % 2 === 0 ? "00" : "30";
              const val = `${String(hour).padStart(2, "0")}:${min}`;
              return <option key={val}>{val}</option>;
            })}
          </select>
        </div>
        <button className="btn-accent w-full mt-2" onClick={handleDatesNext}>Confirm Window</button>
        {error && <div className="text-red-500 font-mono text-[10px] mt-2 uppercase tracking-widest font-bold text-center">{error}</div>}
      </div>
    );
  } else if (step === "insurance") {
    controlPanel = (
      <div className="flex gap-3">
        {["Premium — Zero Risk Coverage", "Basic — Standard Protection", "None — Rider Responsibility"].map((opt) => (
          <button
            key={opt}
            className="btn-accent flex-1"
            onClick={() => handleInsurance(opt.toLowerCase())}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  } else if (step === "identity") {
    controlPanel = (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            className="input flex-1 bg-[#050505] border border-white/10 p-4 rounded-sm font-mono text-[10px] uppercase tracking-widest text-white placeholder:text-zinc-600 focus:border-[#CDA755] outline-none transition-colors"
            placeholder="COMMANDER NAME"
            value={input.name}
            onChange={(e) => handleIdentityChange("name", e.target.value)}
          />
          <input
            type="email"
            className="input flex-1 bg-[#050505] border border-white/10 p-4 rounded-sm font-mono text-[10px] uppercase tracking-widest text-white placeholder:text-zinc-600 focus:border-[#CDA755] outline-none transition-colors"
            placeholder="SECURE EMAIL"
            value={input.email}
            onChange={(e) => handleIdentityChange("email", e.target.value)}
          />
        </div>
        <button className="btn-accent w-full mt-2" onClick={handleIdentityNext}>Verify Identity</button>
        {error && <div className="text-red-500 font-mono text-[10px] mt-2 uppercase tracking-widest font-bold text-center">{error}</div>}
      </div>
    );
  } else if (step === "confirm") {
    if (recoveryState) {
      controlPanel = (
        <div className="flex flex-col gap-3">
          <div className="border border-[#CDA755]/20 bg-[#121212] px-4 py-3 rounded-sm">
            <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#CDA755] font-black">
              Hold Window Active
            </div>
            <div className="mt-2 text-[10px] font-mono uppercase tracking-[0.14em] leading-5 text-zinc-400">
              {TEMP_HOLD_COPY}
              {recoveryState.linkedEmail ? `\n\nLinked contact: ${recoveryState.linkedEmail}` : ""}
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn-accent flex-1" onClick={handleRetryUplink} disabled={loading}>
              {loading ? "Re-Establishing..." : "Retry Secure Uplink"}
            </button>
            <button className="btn-panel flex-1" onClick={handleOpsConfirmation} disabled={loading}>
              Continue via Ops Confirmation
            </button>
          </div>
        </div>
      );
    } else {
      controlPanel = (
        <div className="flex flex-col gap-3">
          <div className="border border-[#CDA755]/30 bg-[#121212] px-4 py-3 rounded-sm">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#CDA755] font-black mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#CDA755] rounded-full animate-pulse"></span>
              Operator Terms Verification
            </div>
            <div className="text-[9px] font-mono text-zinc-400 leading-relaxed uppercase tracking-widest space-y-2">
              <p>Commander, please note {operatorName} requires a <strong className="text-white">{legalAcknowledgement.securityDepositAmount}</strong> security deposit on arrival.</p>
              <p><strong className="text-zinc-500">Deposit Policy:</strong> {legalAcknowledgement.securityDepositPolicy}</p>
              <p><strong className="text-zinc-500">Cancellation:</strong> {legalAcknowledgement.cancellationPolicy}</p>
            </div>
          </div>
          <button className="btn-accent w-full relative overflow-hidden group" onClick={handleConfirm} disabled={loading}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            {loading ? "Establishing Uplink..." : "Lock This Machine Now"}
          </button>
        </div>
      );
    }
  } else if (step === "success") {
    controlPanel = (
      <div className="flex flex-col gap-3">
        <div className="text-center text-[#CDA755] font-black py-2 font-mono text-xs tracking-[0.3em] uppercase">
          {successMode === "ops" ? "Ops Hold Active" : "Mission Confirmed"}
        </div>
        <Link to="/airport" className="btn-panel w-full text-center">
          Explore Hub Operations
        </Link>
      </div>
    );
  }

  const renderMessage = (msg, idx) => {
    if (msg.from === "experience") {
      return (
        <div key={idx} className="flex justify-start w-full my-4">
          <div className="flex flex-col gap-2 w-[90%] bg-[#0A0A0A] border border-[#CDA755]/20 p-4 rounded-sm shadow-[0_0_20px_rgba(205,167,85,0.08)]">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-sm border border-[#CDA755]/30 bg-[#CDA755]/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[#CDA755] text-[10px]">📍</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[9px] text-[#CDA755] font-black uppercase tracking-[0.2em]">{msg.payload.title}</span>
                  <span className="font-mono text-[8px] text-zinc-500 font-bold uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-sm border border-white/10">{msg.payload.category}</span>
                </div>
                <span className="font-mono text-[10px] text-zinc-300 leading-5 uppercase tracking-[0.1em] font-semibold">{msg.text}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (msg.from === "itinerary") {
      const daysToShow = msg.payload.days.slice(0, 3);
      const hasMore = msg.payload.days.length > 3;
      
      return (
        <div key={idx} className="flex justify-start w-full my-3">
          <div className="flex flex-col gap-2 w-[95%]">
            {daysToShow.map(day => (
              <div key={day.day} className="bg-[#050505] border border-[#CDA755]/30 p-4 rounded-sm shadow-[0_0_15px_rgba(205,167,85,0.05)]">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-[10px] text-[#CDA755] font-black uppercase tracking-[0.2em]">Day {day.day} — {day.title}</span>
                  <span className="font-mono text-[9px] text-zinc-500 font-bold uppercase">~{day.distanceKm}km</span>
                </div>
                <p className="font-mono text-[9px] text-zinc-400 leading-4 mb-3 uppercase tracking-widest">{day.summary}</p>
                <div className="flex flex-wrap gap-1.5">
                  {day.highlights.map((h, i) => (
                    <span key={i} className="text-[8px] font-mono text-zinc-500 bg-white/5 px-2 py-1 rounded-sm border border-white/10 uppercase tracking-widest font-bold">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {hasMore && (
              <div className="text-center text-[9px] font-mono text-[#CDA755] uppercase tracking-widest mt-1 font-bold">
                + {msg.payload.days.length - 3} days in active deployment
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        key={idx}
        className={`flex ${msg.from === "ai" ? "justify-start" : "justify-end"}`}
      >
        <div
          className={`rounded-sm px-4 py-3 my-1.5 max-w-[85%] text-[10px] leading-5 whitespace-pre-wrap uppercase tracking-[0.15em] font-bold font-mono ${
            msg.from === "ai"
              ? "bg-[#121212] text-[#CDA755] shadow-[0_0_15px_rgba(205,167,85,0.08)] border border-[#CDA755]/20"
              : "bg-[#CDA755] text-[#050505] shadow-[0_0_15px_rgba(205,167,85,0.15)]"
          }`}
        >
          {msg.text}
        </div>
      </div>
    );
  };

  return (
    <div
      className="flex flex-col justify-between rounded-sm border border-[#CDA755]/30 shadow-[0_0_40px_rgba(205,167,85,0.1)] relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0A0A0A 0%, #050505 100%)",
        minHeight: 520,
        maxWidth: 460,
        width: "100%",
        padding: 0,
      }}
    >
      {/* Tactical UI Layers */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#CDA755] opacity-[0.07] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#CDA755]/50 to-transparent opacity-50" />
      
      {/* Terminal Header */}
      <div className="px-5 py-3 border-b border-white/5 bg-[#050505]/80 backdrop-blur flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[#CDA755] animate-pulse" />
          <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-zinc-500 font-black">Secure Uplink</span>
        </div>
        <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#CDA755] font-black">{airportCode} // {machineName.substring(0,8)}</span>
      </div>

      {/* Chat Ledger */}
      <div
        className="flex-1 overflow-y-auto px-5 py-6 relative z-10"
        style={{ minHeight: 340 }}
      >
        {messages.map(renderMessage)}
        <div ref={endRef} className="h-4" />
      </div>

      {/* Telemetry Waveform */}
      <div className="h-1.5 w-full bg-[#050505] flex items-center justify-center gap-[2px] opacity-30 px-5 z-10 relative overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="w-1 bg-[#CDA755] animate-pulse" style={{ height: Math.max(1, Math.random() * 6) + 'px', animationDelay: `${Math.random() * 1.5}s`, opacity: Math.random() }} />
        ))}
      </div>

      {/* Control Panel */}
      <div
        className="px-5 py-5 border-t border-[#CDA755]/20 bg-[#0A0A0A] relative z-10"
        style={{
          boxShadow: "0 -4px 30px 0 rgba(205,167,85,0.05)",
        }}
      >
        {/* Helper styles for buttons directly in the component so it's portable */}
        <style dangerouslySetInnerHTML={{__html: `
          .btn-accent {
            background-color: #CDA755;
            color: #050505;
            padding: 12px 20px;
            font-family: monospace;
            font-size: 10px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.25em;
            border-radius: 2px;
            transition: all 0.2s;
            box-shadow: 0 4px 14px rgba(205,167,85,0.2);
          }
          .btn-accent:hover:not(:disabled) {
            background-color: #E2BB66;
            box-shadow: 0 6px 20px rgba(205,167,85,0.3);
          }
          .btn-accent:disabled {
            background-color: #333;
            color: #666;
            cursor: not-allowed;
            box-shadow: none;
          }
          .btn-panel {
            background-color: #121212;
            color: #CDA755;
            border: 1px solid rgba(205,167,85,0.3);
            padding: 12px 20px;
            font-family: monospace;
            font-size: 10px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.25em;
            border-radius: 2px;
            transition: all 0.2s;
          }
          .btn-panel:hover {
            background-color: rgba(205,167,85,0.1);
            border-color: rgba(205,167,85,0.6);
          }
        `}} />
        {controlPanel}
      </div>
    </div>
  );
}
