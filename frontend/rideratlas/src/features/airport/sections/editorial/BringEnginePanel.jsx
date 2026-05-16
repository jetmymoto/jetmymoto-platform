import React from "react";
import MotoAirliftBookingForm from "@/features/booking/MotoAirliftBookingForm";
import A2AMissionsSection from "../A2AMissionsSection";

export default function BringEnginePanel({ a }) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <A2AMissionsSection airportCode={a.code} />
      <MotoAirliftBookingForm />
    </div>
  );
}
