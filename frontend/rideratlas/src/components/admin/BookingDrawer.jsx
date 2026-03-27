import React from "react";

export default function BookingDrawer({ booking, onClose }) {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-[#050505]/70" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-[#0b0b0b] border-l border-white/10 p-6 overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-white/60 font-mono">BOOKING</div>
            <div className="text-xl font-bold mt-1">{booking.bookingRef || booking.id}</div>
            <div className="text-white/60 mt-1">{booking.status || "—"}</div>
          </div>
          <button
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="mt-6 space-y-4 text-sm">
          <Row label="Name" value={booking.name} />
          <Row label="Email" value={booking.email} />
          <Row label="Phone" value={booking.phone} />
          <Row label="Bike" value={booking.bike} />
          <Row label="From" value={booking.from} />
          <Row label="To" value={booking.to} />
        </div>

        <div className="mt-8 text-xs text-white/50">
          Later we’ll add: assigned agent, notes, PDFs, resend dossier, timeline, payments.
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="text-white/60 text-xs">{label}</div>
      <div className="mt-1">{value || "—"}</div>
    </div>
  );
}
