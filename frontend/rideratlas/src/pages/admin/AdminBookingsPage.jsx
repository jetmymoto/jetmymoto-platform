import React from "react";
import SeoHelmet from "../../components/seo/SeoHelmet";
import AdminGuard from "../../components/admin/AdminGuard";
import BookingManager from "./BookingManager";

export default function AdminBookingsPage() {
  return (
    <AdminGuard>
      <SeoHelmet
        title="Booking Sales Command | JetMyMoto"
        description="Internal booking and sales command center for logistics, rental, and transport pool intake."
        canonicalUrl="https://jetmymoto.com/admin/bookings"
        noIndex={true}
      />
      <BookingManager />
    </AdminGuard>
  );
}
