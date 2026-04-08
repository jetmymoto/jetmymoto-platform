import React, { useMemo, useState } from "react";
import { Copy, Image, Play, Video } from "lucide-react";

import { GRAPH } from "@/core/network/networkGraph";

function buildInitialMediaData() {
  const mediaData = [];

  // Rentals
  Object.values(GRAPH?.rentals || {}).forEach((rental) => {
    const id = rental?.id || "";
    mediaData.push({
      id,
      uid: `Rental-${id}`,
      type: "Rental",
      title: rental?.model || "Unknown Model",
      subtitle: rental?.airport || "---",
      videoUrl: typeof rental?.videoUrl === "string" ? rental.videoUrl : "",
      imageUrl: typeof rental?.imageUrl === "string" ? rental.imageUrl : "",
    });
  });

  // Airports
  Object.values(GRAPH?.airports || {}).forEach((airport) => {
    const id = airport?.code || "";
    mediaData.push({
      id,
      uid: `Airport-${id}`,
      type: "Airport",
      title: airport?.city || "Unknown City",
      subtitle: airport?.code || "---",
      videoUrl: typeof airport?.hero?.videoUrl === "string" ? airport.hero.videoUrl : "",
      imageUrl: typeof (airport?.hero?.posterUrl || airport?.imageUrl) === "string" ? (airport.hero?.posterUrl || airport.imageUrl) : "",
    });
  });

  // Routes
  Object.values(GRAPH?.routes || {}).forEach((route) => {
    const id = route?.slug || "";
    mediaData.push({
      id,
      uid: `Route-${id}`,
      type: "Route",
      title: route?.name || route?.title || "Unknown Route",
      subtitle: route?.slug || "---",
      videoUrl: typeof route?.videoUrl === "string" ? route.videoUrl : "",
      imageUrl: typeof (route?.image || route?.imageUrl) === "string" ? (route.image || route.imageUrl) : "",
    });
  });

  // Destinations
  Object.values(GRAPH?.destinations || {}).forEach((destination) => {
    const id = destination?.slug || "";
    mediaData.push({
      id,
      uid: `Destination-${id}`,
      type: "Destination",
      title: destination?.name || "Unknown Destination",
      subtitle: destination?.slug || "---",
      videoUrl: typeof destination?.videoUrl === "string" ? destination.videoUrl : "",
      imageUrl: typeof (destination?.image || destination?.imageUrl) === "string" ? (destination.image || destination.imageUrl) : "",
    });
  });

  return mediaData.sort((left, right) => left.id.localeCompare(right.id));
}

function hasMedia(machine) {
  return Boolean(machine.videoUrl.trim() || machine.imageUrl.trim());
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#121212] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.28)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            {label}
          </div>
          <div className="mt-3 text-3xl font-black tabular-nums text-white">
            {value}
          </div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#A76330]/30 bg-[#A76330]/12">
          <Icon className="h-5 w-5 text-[#CDA755]" />
        </div>
      </div>
    </div>
  );
}

function MediaPreview({ type, subtitle, videoUrl, imageUrl, title }) {
  const getBadgeText = (type) => {
    switch (type) {
      case "Airport": return "Airport Hub";
      case "Route": return "Ride Route";
      case "Rental": return "Rental Fleet";
      case "Destination": return "Destination";
      default: return type;
    }
  };

  const hasVideo = Boolean(videoUrl && videoUrl.trim());
  const hasImage = Boolean(imageUrl && imageUrl.trim());

  if (hasVideo) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-[28px] border border-white/10 bg-[#121212]">
        <video
          key={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/10" />
        <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-[#050505]/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#CDA755]">
          {getBadgeText(type)}
        </div>
      </div>
    );
  }

  if (hasImage) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-[28px] border border-white/10 bg-[#121212]">
        <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/10" />
        <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-[#050505]/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#CDA755]">
          {getBadgeText(type)}
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-[28px] border border-dashed border-[#A76330]/35 bg-[linear-gradient(145deg,rgba(18,18,18,0.98),rgba(5,5,5,0.96))]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(205,167,85,0.12),transparent_55%)]" />
      <div className="relative flex h-full flex-col items-center justify-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#A76330]/35 bg-[#A76330]/10">
          <Video className="h-8 w-8 text-[#CDA755]" />
        </div>
        <div className="text-[11px] uppercase tracking-[0.32em] text-zinc-500">
          Awaiting Media Asset
        </div>
      </div>
      <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-[#050505]/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#CDA755]">
        {getBadgeText(type)}
      </div>
    </div>
  );
}

export default function AdminMediaManager() {
  const [mediaData, setMediaData] = useState(buildInitialMediaData);
  const [activeTab, setActiveTab] = useState("ALL");

  // Safely filter data by mapping the plural tab state to the singular item type
  const filteredMediaData = useMemo(() => {
    if (activeTab === "ALL") return mediaData;

    // Map plural tabs to singular data types
    const typeMapping = {
      Rentals: "Rental",
      Airports: "Airport",
      Routes: "Route",
      Destinations: "Destination",
    };

    const targetType = typeMapping[activeTab];
    if (!targetType) return mediaData;

    return mediaData.filter((item) => item.type === targetType);
  }, [mediaData, activeTab]);

  const stats = useMemo(() => {
    const data = filteredMediaData;
    const withVideo = data.filter((item) => item.videoUrl.trim()).length;
    const withImage = data.filter((item) => item.imageUrl.trim()).length;
    const withAnyMedia = data.filter(hasMedia).length;

    return {
      total: data.length,
      withVideo,
      withImage,
      withAnyMedia,
    };
  }, [filteredMediaData]);

  const handleUpdate = (uid, field, value) => {
    setMediaData((current) =>
      current.map((item) =>
        item.uid === uid ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleExportPayload = async () => {
    const payload = filteredMediaData.filter(hasMedia);
    const grouped = payload.reduce((acc, item) => {
      const typeKey = item.type.toLowerCase() + "s"; // rentals, airports, routes, destinations
      if (!acc[typeKey]) acc[typeKey] = [];
      acc[typeKey].push(item);
      return acc;
    }, {});
    const serialized = JSON.stringify(grouped, null, 2);

    try {
      if (!navigator?.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable");
      }

      await navigator.clipboard.writeText(serialized);
      window.alert(`Media payload copied for ${payload.length} items.`);
    } catch (error) {
      window.alert(`Unable to copy media payload: ${error.message}`);
    }
  };

  return (
    <div className="space-y-8 text-white">
      <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,rgba(18,18,18,0.98),rgba(5,5,5,0.96))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] lg:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="text-[10px] uppercase tracking-[0.34em] text-[#CDA755]">
              Visual QA Surface
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white lg:text-5xl">
              Media Admin Dashboard v2.0
            </h1>
            <p className="mt-4 text-sm leading-7 text-zinc-400 lg:text-base">
              Audit cinematic coverage across all platform entities, preview autoplay media, and hot-swap Firebase asset URLs directly against graph-derived records.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportPayload}
            className="inline-flex items-center justify-center gap-3 rounded-full border border-[#A76330]/40 bg-[#A76330]/14 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-[#CDA755]/50 hover:bg-[#A76330]/24"
          >
            <Copy className="h-4 w-4 text-[#CDA755]" />
            Export Media Payload
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Video} label="Total Records" value={stats.total} />
        <StatCard icon={Play} label="Cinematic Video" value={stats.withVideo} />
        <StatCard icon={Image} label="Fallback Image" value={stats.withImage} />
        <StatCard icon={Copy} label="Media Ready" value={stats.withAnyMedia} />
      </section>

      <section className="flex flex-wrap gap-2">
        {["ALL", "Rentals", "Airports", "Routes", "Destinations"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab
                ? "border-[#CDA755] bg-[#CDA755]/20 text-[#CDA755]"
                : "border-white/10 bg-[#121212] text-zinc-400 hover:border-[#A76330]/50 hover:bg-[#A76330]/14"
            }`}
          >
            {tab}
          </button>
        ))}
      </section>

      <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {filteredMediaData.map((item) => {
          const title = item.title;
          const hasVideo = item.videoUrl.trim().length > 0;
          const hasImage = item.imageUrl.trim().length > 0;

          return (
            <article
              key={item.uid}
              className="overflow-hidden rounded-[30px] border border-white/10 bg-[#121212] shadow-[0_20px_40px_rgba(0,0,0,0.28)]"
            >
              <div className="p-4">
                <MediaPreview
                  type={item.type}
                  subtitle={item.subtitle}
                  videoUrl={item.videoUrl}
                  imageUrl={item.imageUrl}
                  title={title}
                />
              </div>

              <div className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(8,8,8,0.98))] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                      {item.type}
                    </div>
                    <h2 className="mt-2 text-2xl font-bold text-white">
                      {item.title}
                    </h2>
                    <p className="text-sm uppercase tracking-[0.22em] text-[#CDA755]">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#050505] px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-zinc-400">
                      <Play className="h-3.5 w-3.5 text-[#CDA755]" />
                      {hasVideo ? "Video Linked" : "No Video"}
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#050505] px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-zinc-400">
                      <Image className="h-3.5 w-3.5 text-[#CDA755]" />
                      {hasImage ? "Image Linked" : "No Image"}
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.26em] text-zinc-500">
                      Cinematic Video URL (.mp4)
                    </span>
                    <input
                      type="text"
                      value={item.videoUrl}
                      onChange={(event) =>
                        handleUpdate(item.uid, "videoUrl", event.target.value)
                      }
                      placeholder="https://firebasestorage.googleapis.com/.../cinematic.mp4"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#A76330]/60"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.26em] text-zinc-500">
                      Fallback Image URL (.jpg)
                    </span>
                    <input
                      type="text"
                      value={item.imageUrl}
                      onChange={(event) =>
                        handleUpdate(item.uid, "imageUrl", event.target.value)
                      }
                      placeholder="https://firebasestorage.googleapis.com/.../fallback.jpg"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-[#050505] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#A76330]/60"
                    />
                  </label>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
