import React, { useEffect, useMemo, useState } from "react";
import { db } from "../../lib/firebase"; // adjust if your export differs
import {
  collection,
  onSnapshot,
  orderBy,
  query as fsQuery,
  updateDoc,
  doc,
} from "firebase/firestore";
import BookingDrawer from "./BookingDrawer";

function normalize(s) {
  return String(s || "").toLowerCase();
}

export default function BookingsTable({ filters }) {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = fsQuery(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRows(data);
        setLoading(false);
      },
      (err) => {
        console.error("Bookings onSnapshot error:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const status = filters?.status || "ALL";
    const q = normalize(filters?.query);

    return rows.filter((r) => {
      if (status !== "ALL" && normalize(r.status) !== normalize(status)) return false;
      if (!q) return true;

      const hay = [
        r.bookingRef,
        r.name,
        r.email,
        r.phone,
        r.bike,
        r.from,
        r.to,
      ]
        .map(normalize)
        .join(" ");

      return hay.includes(q);
    });
  }, [rows, filters]);

  async function setStatus(row, nextStatus) {
    try {
      await updateDoc(doc(db, "bookings", row.id), {
        status: nextStatus,
        updatedAt: new Date(),
      });
    } catch (e) {
      console.error("Update status failed:", e);
      alert("Failed to update status. Check console/logs.");
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="text-sm text-white/70">
          {loading ? "Loading…" : `${filtered.length} booking(s)`}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-white/60">
            <tr className="border-b border-white/10">
              <th className="text-left font-medium px-5 py-3">Ref</th>
              <th className="text-left font-medium px-5 py-3">Rider</th>
              <th className="text-left font-medium px-5 py-3">Route</th>
              <th className="text-left font-medium px-5 py-3">Bike</th>
              <th className="text-left font-medium px-5 py-3">Status</th>
              <th className="text-right font-medium px-5 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                onClick={() => setSelected(r)}
              >
                <td className="px-5 py-3 font-mono text-xs text-white/80">
                  {r.bookingRef || r.id}
                </td>
                <td className="px-5 py-3">
                  <div className="font-medium">{r.name || "—"}</div>
                  <div className="text-white/60 text-xs">{r.email || "—"}</div>
                </td>
                <td className="px-5 py-3 text-white/80">
                  {(r.from || "—") + " → " + (r.to || "—")}
                </td>
                <td className="px-5 py-3 text-white/80">{r.bike || "—"}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-white/10 border border-white/10 text-xs">
                    {r.status || "—"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <select
                    className="bg-[#050505]/40 border border-white/10 rounded-lg px-2 py-1 text-xs"
                    value={r.status || "NEW"}
                    onChange={(e) => setStatus(r, e.target.value)}
                  >
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </td>
              </tr>
            ))}

            {!loading && filtered.length === 0 && (
              <tr>
                <td className="px-5 py-10 text-center text-white/60" colSpan={6}>
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <BookingDrawer booking={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
