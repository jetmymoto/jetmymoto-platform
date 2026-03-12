import React, { useMemo, useState } from "react";
import AdminGuard from "../../components/admin/AdminGuard";
import BookingsTable from "../../components/admin/BookingsTable";
import SeoHelmet from '../../components/seo/SeoHelmet'; // Import SeoHelmet

export default function AdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [query, setQuery] = useState("");

  const filters = useMemo(
    () => ({
      status: statusFilter,
      query: query.trim(),
    }),
    [statusFilter, query]
  );

  return (
    <AdminGuard>
      <SeoHelmet
        title="Admin Bookings | JetMyMoto"
        description="Admin panel for managing JetMyMoto bookings."
        canonicalUrl="https://jetmymoto.com/admin/bookings"
        noIndex={true}
      />
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
              <p className="text-white/60 mt-2">
                Manage JetMyMoto booking requests (Firestore: <span className="font-mono">bookings</span>)
              </p>
            </div>

            <div className="flex gap-3 items-center flex-wrap">
              <select
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All</option>
                <option value="NEW">NEW</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>

              <input
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm w-72 max-w-full"
                placeholder="Search name, email, ref, route…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-8">
            <BookingsTable filters={filters} />
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
