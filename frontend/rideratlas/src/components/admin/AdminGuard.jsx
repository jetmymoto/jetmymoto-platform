import React from "react";
import { useAuth } from "../../AuthContext";

// Quick allowlist guard (Phase 1).
// Later: replace with custom claims or Firestore role doc.
const ADMIN_EMAILS = new Set([
  "info@jetmymoto.com",
  "vladisin80@gmail.com",
]);

export default function AdminGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-sm opacity-70">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-sm opacity-70">Please sign in to access admin.</div>
      </div>
    );
  }

  const email = (user.email || "").toLowerCase();
  if (!ADMIN_EMAILS.has(email)) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-sm opacity-70">Access denied.</div>
      </div>
    );
  }

  return children;
}
