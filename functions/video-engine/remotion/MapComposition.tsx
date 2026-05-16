import React, {useEffect, useMemo, useRef} from "react";
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  AbsoluteFill,
  cancelRender,
  continueRender,
  delayRender,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {buildRouteGeo} from "../utils/buildRouteGeo";

type Mission = {
  title: string;
  slug: string;
  insertion_airport: string;
  extraction_airport: string;
  subtitle?: string;
  subsidyPct?: number;
  price_radar?: {
    subsidy_pct?: number;
  };
  coordinates: Array<[number, number]>;
};

type Props = {
  mission: Mission;
  mapboxToken: string;
};

// ── Cinematic timing constants ────────────────────────────────────────────
const DIVE_FRAMES = 30; // Act 0: Dive
const SETTLE_FRAMES = 30; // End: Overshoot & Settle

// ── Helpers ───────────────────────────────────────────────────────────────

function computeBearing(from: [number, number], to: [number, number]): number {
  const lng1 = from[0] * Math.PI / 180;
  const lat1 = from[1] * Math.PI / 180;
  const lng2 = to[0] * Math.PI / 180;
  const lat2 = to[1] * Math.PI / 180;

  const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);

  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
}

function stripMapStyle(map: mapboxgl.Map) {
  const style = map.getStyle();
  for (const layer of style.layers || []) {
    const id = layer.id.toLowerCase();
    const hideLayer =
      layer.type === "symbol" ||
      layer.type === "fill-extrusion" ||
      id.includes("road") ||
      id.includes("label") ||
      id.includes("transit") ||
      id.includes("settlement") ||
      id.includes("poi");

    if (hideLayer) {
      map.setLayoutProperty(layer.id, "visibility", "none");
    }
  }
}

function setMarkerScale(marker: mapboxgl.Marker | null, scale: number) {
  const element = marker?.getElement();
  if (!element) {
    return;
  }

  element.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

function toRenderableRouteFeature(
  sliced: GeoJSON.Feature<GeoJSON.LineString>,
  fallbackPoint: [number, number],
): GeoJSON.Feature<GeoJSON.LineString> {
  const coordinates = sliced.geometry.coordinates.length >= 2 ?
    sliced.geometry.coordinates as [number, number][] :
    [fallbackPoint, fallbackPoint];

  return turf.lineString(coordinates) as GeoJSON.Feature<GeoJSON.LineString>;
}

function getAnimatedRouteFeature(
  routeLine: turf.helpers.Feature<turf.helpers.LineString>,
  currentDistance: number,
  currentPoint: [number, number],
): GeoJSON.Feature<GeoJSON.LineString> {
  if (currentDistance <= 0) {
    return turf.lineString([currentPoint, currentPoint]) as GeoJSON.Feature<GeoJSON.LineString>;
  }

  const sliced = turf.lineSliceAlong(
      routeLine,
      0,
      currentDistance,
      {units: "kilometers"},
  );

  return toRenderableRouteFeature(sliced, currentPoint);
}

export const MapComposition: React.FC<Props> = ({mission, mapboxToken}) => {
  if (typeof window === "undefined") return null;

  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const isBrowser = typeof window !== "undefined";
  const [handle] = React.useState(() => (
    isBrowser ? delayRender("Loading Mapbox route map") : null
  ));
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const didResolveHandleRef = useRef(false);
  const prevBearingRef = useRef<number | null>(null);
  const routeGeo = useMemo(() => buildRouteGeo(mission), [mission]);
  const routeLine = useMemo(
      () => turf.lineString(routeGeo.coordinates),
      [routeGeo.coordinates],
  );
  const routeDistance = useMemo(
      () => turf.length(routeLine, {units: "kilometers"}),
      [routeLine],
  );
  const originMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destinationMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const getCameraParams = (
    frame: number,
    durationInFrames: number,
    routeDistance: number,
    routeLine: turf.helpers.Feature<turf.helpers.LineString>,
    initialBearing: number
  ) => {
    // Act 0: Dive (Frame 0 to DIVE_FRAMES)
    if (frame <= DIVE_FRAMES) {
      const progress = frame / DIVE_FRAMES;
      const eased = Easing.out(Easing.quad)(progress);
      const startCoord = routeLine.geometry.coordinates[0] as [number, number];
      
      return {
        center: startCoord,
        zoom: interpolate(eased, [0, 1], [2, 10]),
        pitch: interpolate(eased, [0, 1], [30, 60]),
        bearing: initialBearing,
        progress: 0,
      };
    }

    // Act 1-3: Flyover (DIVE_FRAMES to durationInFrames - SETTLE_FRAMES)
    const flyoverDuration = durationInFrames - DIVE_FRAMES - SETTLE_FRAMES;
    const flyoverFrame = frame - DIVE_FRAMES;
    
    if (flyoverFrame <= flyoverDuration) {
      const progress = Easing.inOut(Easing.cubic)(flyoverFrame / flyoverDuration);
      const currentDistance = routeDistance * progress;
      
      const basePoint = turf.along(routeLine, currentDistance, { units: "kilometers" })
        .geometry.coordinates as [number, number];

      // Helicopter Drift: Inject subtle sine-wave jitter (± 0.00015°)
      const driftX = Math.sin(frame * 0.08) * 0.00015;
      const driftY = Math.cos(frame * 0.07) * 0.00015;
      const currentPoint: [number, number] = [basePoint[0] + driftX, basePoint[1] + driftY];

      const lookAheadDistance = Math.min(
        routeDistance,
        currentDistance + Math.max(routeDistance * 0.03, 0.5)
      );
      const lookAhead = turf.along(routeLine, lookAheadDistance, { units: "kilometers" })
        .geometry.coordinates as [number, number];

      const rawBearing = computeBearing(basePoint, lookAhead);
      
      return {
        center: currentPoint,
        zoom: interpolate(progress, [0, 1], [10, 12.5]),
        pitch: interpolate(progress, [0, 1], [60, 65]),
        bearing: rawBearing,
        progress,
      };
    }

    // Overshoot & Settle (Final SETTLE_FRAMES)
    const settleFrame = frame - (durationInFrames - SETTLE_FRAMES);
    const settleProgress = settleFrame / SETTLE_FRAMES;
    const endPoint = routeLine.geometry.coordinates[routeLine.geometry.coordinates.length - 1] as [number, number];
    
    // Overshoot zoom: zoom in past target, then settle back
    const zoom = interpolate(
      settleProgress, 
      [0, 0.5, 1.0], 
      [12.5, 13.2, 12.8],
      { extrapolateRight: "clamp" }
    );

    return {
      center: endPoint,
      zoom,
      pitch: 65,
      bearing: prevBearingRef.current || 0,
      progress: 1,
    };
  };

  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    if (!containerRef.current) {
      return;
    }

    if (!mapboxToken || mapboxToken.length < 20) {
      const error = new Error(
          `Mapbox API token missing or invalid in inputProps (length: ${mapboxToken?.length || 0}). ` +
          "Ensure REMOTION_MAPBOX_TOKEN is passed to the renderer.",
      );
      cancelRender(error);
      return;
    }

    mapboxgl.accessToken = mapboxToken;
    didResolveHandleRef.current = false;
    const mapLoadTimeout = window.setTimeout(() => {
      if (handle) {
        cancelRender(new Error("Mapbox map did not finish loading in time."));
      }
    }, 45000);

    const resolveHandle = () => {
      if (!handle || didResolveHandleRef.current) {
        return;
      }

      didResolveHandleRef.current = true;
      window.clearTimeout(mapLoadTimeout);
      continueRender(handle);
    };

    // Initial camera: start with Act 0 "Dive" initial state
    const startCoord = routeGeo.coordinates[0];
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: startCoord,
      zoom: 2, // Start wide for dive
      pitch: 30,
      bearing: routeGeo.initialBearing,
      interactive: false,
      attributionControl: false,
      fadeDuration: 0,
      preserveDrawingBuffer: true,
      antialias: true,
    });
    mapRef.current = map;

    map.once("load", () => {
      stripMapStyle(map);
      map.addSource("mission-route", {
        type: "geojson",
        data: turf.lineString([startCoord, startCoord]),
      });

      // Layer 1 (The Glow): Amber (#CDA755), 10px width, 15px blur, 0.4 opacity
      map.addLayer({
        id: "mission-route-glow",
        type: "line",
        source: "mission-route",
        paint: {
          "line-color": "#CDA755",
          "line-width": 10,
          "line-opacity": 0.4,
          "line-blur": 15,
        },
      });

      // Layer 2 (The Core): Amber (#CDA755), 4px width, 0.9 opacity
      map.addLayer({
        id: "mission-route-main",
        type: "line",
        source: "mission-route",
        paint: {
          "line-color": "#CDA755",
          "line-width": 4,
          "line-opacity": 0.9,
        },
      });

      const originEl = document.createElement("div");
      originEl.style.width = "18px";
      originEl.style.height = "18px";
      originEl.style.borderRadius = "999px";
      originEl.style.background = "#46d37c";
      originEl.style.border = "2px solid rgba(255,255,255,0.85)";
      originEl.style.boxShadow = "0 0 24px rgba(70,211,124,0.4)";
      originEl.style.transform = "translate(-50%, -50%)";

      const destinationEl = document.createElement("div");
      destinationEl.style.width = "18px";
      destinationEl.style.height = "18px";
      destinationEl.style.borderRadius = "999px";
      destinationEl.style.background = "#CDA755";
      destinationEl.style.border = "2px solid rgba(255,255,255,0.85)";
      destinationEl.style.boxShadow = "0 0 24px rgba(205,167,85,0.4)";
      destinationEl.style.transform = "translate(-50%, -50%)";

      originMarkerRef.current = new mapboxgl.Marker({element: originEl})
          .setLngLat(startCoord)
          .addTo(map);

      destinationMarkerRef.current = new mapboxgl.Marker({element: destinationEl})
          .setLngLat(routeGeo.coordinates[routeGeo.coordinates.length - 1])
          .addTo(map);

      map.once("render", () => {
        window.setTimeout(resolveHandle, 500);
      });
      map.once("idle", resolveHandle);
    });

    map.on("error", (event) => {
      window.clearTimeout(mapLoadTimeout);
      if (handle) {
        cancelRender(event.error || new Error("Mapbox failed to load."));
      }
    });

    return () => {
      window.clearTimeout(mapLoadTimeout);
      originMarkerRef.current?.remove();
      destinationMarkerRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [handle, isBrowser, mapboxToken, routeGeo.center, routeGeo.coordinates, routeGeo.initialBearing, routeGeo.initialZoom]);

  // ── Per-frame cinematic camera update ────────────────────────────────────

  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    const map = mapRef.current;
    if (!map) {
      return;
    }

    const { center, zoom, pitch, bearing, progress } = getCameraParams(
      frame,
      durationInFrames,
      routeDistance,
      routeLine,
      routeGeo.initialBearing
    );

    // ── Route draw ────────────────────────────────────────────────────────
    const currentDistance = routeDistance * progress;
    const source = map.getSource("mission-route") as mapboxgl.GeoJSONSource | undefined;
    const renderableRoute = getAnimatedRouteFeature(
      routeLine, currentDistance, center,
    );
    source?.setData(renderableRoute);

    // ── Apply Smooth Bearing ──────────────────────────────────────────────
    const prev = prevBearingRef.current ?? bearing;
    let bearingDelta = bearing - prev;
    if (bearingDelta > 180) bearingDelta -= 360;
    if (bearingDelta < -180) bearingDelta += 360;
    const smoothBearing = prev + bearingDelta * 0.15;
    prevBearingRef.current = smoothBearing;

    map.jumpTo({center, zoom, pitch, bearing: smoothBearing});

    // ── Marker pulse animation ────────────────────────────────────────────
    const pulse = interpolate(frame % fps, [0, fps / 2, fps - 1], [1, 1.18, 1]);
    setMarkerScale(originMarkerRef.current, pulse);

    // Destination marker grows as camera approaches
    const destScale = interpolate(progress, [0.7, 1.0], [1.0, 1.3], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    setMarkerScale(destinationMarkerRef.current, destScale);
  }, [durationInFrames, fps, frame, isBrowser, routeDistance, routeGeo.coordinates, routeGeo.initialZoom, routeLine]);

  if (!isBrowser) {
    return null;
  }

  const subsidyPct = mission.subsidyPct ?? mission.price_radar?.subsidy_pct ?? null;

  return (
    <AbsoluteFill>
      <div
        ref={containerRef}
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle at 20% 20%, rgba(33,68,76,0.45), rgba(2,5,8,1) 60%)",
        }}
      />
      
      {/* Post-Processing Overlays */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(circle, transparent 40%, rgba(5,5,5,0.7) 100%)",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, rgba(5,5,5,0.9) 0%, transparent 15%)",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, rgba(2,5,8,0.1) 0%, rgba(2,5,8,0.4) 100%)",
          padding: 72,
          fontFamily: "Georgia, serif",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 24,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "rgba(205, 167, 85, 0.95)",
            }}
          >
            OP: MISSION // {mission.insertion_airport} → {mission.extraction_airport}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 48,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 64,
                lineHeight: 1,
                fontWeight: 600,
                textShadow: "0 12px 32px rgba(0,0,0,0.28)",
              }}
            >
              {mission.title}
            </div>
            {mission.subtitle ? (
              <div
                style={{
                  marginTop: 18,
                  fontSize: 26,
                  lineHeight: 1.4,
                  maxWidth: 960,
                  color: "rgba(255,255,255,0.72)",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                }}
              >
                {mission.subtitle}
              </div>
            ) : null}
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 30,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(205, 167, 85, 0.95)",
              whiteSpace: "nowrap",
            }}
          >
            {subsidyPct ? `${subsidyPct}% Subsidised` : "Mission Ready"}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};