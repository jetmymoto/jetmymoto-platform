import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import SeoHelmet from '../components/seo/SeoHelmet'; // Import SeoHelmet
import { createAdminPoster } from "@/services/adminPosterService";

export default function AdminPostersPage() {
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [gradient, setGradient] = useState(0.75);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const generateAndSave = async () => {
    if (!imageUrl || !title) {
      setError("Image URL and title are required.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const renderId = `admin-${Date.now()}`;

    const posterConfig = {
      gradient_strength: Number(gradient),
    };

    try {
      // 1️⃣ Call poster engine
      const data = await createAdminPoster({
        mission_id: renderId,
        image_url: imageUrl,
        title,
        subtitle,
        difficulty: "EXPERT",
        poster_config: posterConfig,
      });

      if (data.status === "error") {
        throw new Error(data.message || "Poster generation failed");
      }

      if (!data?.variants?.landscape) {
        throw new Error("Poster engine returned no image");
      }

      // 2️⃣ Save metadata to Firestore
      await addDoc(collection(db, "poster_renders"), {
        render_id: renderId,
        source_image: imageUrl,
        title,
        subtitle,
        poster_config: posterConfig,
        variants: data.variants,
        primary_poster_url: data.variants.landscape,
        engine_version: data.engine_version,
        created_at: serverTimestamp(),
        created_by: "admin",
        status: "generated",
      });

      setResult(data);
    } catch (err) {
      console.error("Poster generation failed:", err);
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-10 max-w-4xl mx-auto">
      <SeoHelmet
        title="Admin Posters Console | JetMyMoto"
        description="Admin console for generating and managing mission posters."
        canonicalUrl="https://jetmymoto.com/admin/posters"
        noIndex={true}
      />
      <h1 className="text-4xl font-black mb-10">
        Poster Command Console
      </h1>

      {/* FORM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          className="bg-[#050505] p-3 border border-white/10"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        <input
          className="bg-[#050505] p-3 border border-white/10"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="bg-[#050505] p-3 border border-white/10 md:col-span-2"
          placeholder="Subtitle (optional)"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
        />

        <input
          type="number"
          min="0"
          max="1"
          step="0.05"
          className="bg-[#050505] p-3 border border-white/10"
          value={gradient}
          onChange={(e) => setGradient(e.target.value)}
        />
      </div>

      {/* ACTION */}
      <button
        onClick={generateAndSave}
        disabled={loading}
        className="mt-6 px-6 py-3 bg-amber-500 text-black font-bold disabled:opacity-50"
      >
        {loading ? "Generating…" : "Generate & Save Poster"}
      </button>

      {/* ERROR */}
      {error && (
        <p className="mt-6 text-red-400">
          {error}
        </p>
      )}

      {/* RESULT */}
      {result?.variants?.landscape && (
        <img
          src={result.variants.landscape}
          alt="Generated poster"
          className="mt-10 max-w-full border border-white/10"
        />
      )}
    </div>
  );
}
