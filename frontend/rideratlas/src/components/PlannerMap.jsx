import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// NEW KEY: V12 (Clears previous corrupt caches)
const CACHE_KEY = "rider_atlas_v12_ironclad"; 
const CACHE_TTL = 1000 * 60 * 60 * 24; 

// Simple polyfill for requestIdleCallback
const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));

export default function PlannerMap({ 
  onMapLoad, 
  onAddStop, 
  selectedIds = [], 
  routeWaypoints = [], 
  onRouteCalculated 
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const db = getFirestore();

  // --- 1. ROBUST DATA FETCHER ---
  const fetchIntel = async () => {
    try {
      // DEBUG: Force clear old junk
      // localStorage.removeItem("rider_atlas_v11_turbo");

      const cachedRaw = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(`${CACHE_KEY}_ts`);
      const isFresh = cachedTimestamp && (Date.now() - parseInt(cachedTimestamp) < CACHE_TTL);

      if (cachedRaw && isFresh) {
        idle(() => {
          try {
            const geojsonFeatures = JSON.parse(cachedRaw);
            console.log(`⚡ CACHE HIT: ${geojsonFeatures.length} POIs loaded.`);
            loadGeoJSON(geojsonFeatures);
          } catch (e) { console.error("Cache corrupted, re-fetching."); }
        });
      } else {
        console.log("📡 FETCHING FIREBASE DATA...");
        const querySnapshot = await getDocs(collection(db, "pois"));
        
        idle(() => {
          const geojsonFeatures = [];
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // --- SAFETY CHECK ---
            // Convert to Number explicitly to handle strings like "11.2"
            const lat = Number(data.latitude);
            const lng = Number(data.longitude);

            // Skip if coordinates are invalid
            if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return;

            const category = (data.category || "UNKNOWN").toUpperCase().trim();
            
            // Handle Score (Flatten object/string to number)
            let score = 0;
            if (data.scores?.cinematic) score = Number(data.scores.cinematic);
            else if (typeof data.scores === 'string' && data.scores.includes('cinematic')) score = 5;

            geojsonFeatures.push({
              type: "Feature",
              geometry: { type: "Point", coordinates: [Number(lng.toFixed(5)), Number(lat.toFixed(5))] },
              properties: { id: doc.id, n: data.name, c: category, s: score }
            });
          });

          console.log(`✅ PROCESSED ${geojsonFeatures.length} VALID POIs`);
          
          // Render
          loadGeoJSON(geojsonFeatures);

          // Save to Cache
          try {
             localStorage.setItem(CACHE_KEY, JSON.stringify(geojsonFeatures));
             localStorage.setItem(`${CACHE_KEY}_ts`, Date.now().toString());
          } catch(e) { console.warn("Cache full"); }
        });
      }
    } catch (err) { console.error("Critical Fetch Error:", err); }
  };

  const loadGeoJSON = (features) => {
    if (!map.current) return;
    const geojson = { type: "FeatureCollection", features };

    if (map.current.getSource("pois")) {
      map.current.getSource("pois").setData(geojson);
    } else {
      map.current.addSource("pois", { type: "geojson", data: geojson });
      map.current.addLayer({
        id: "poi-circles",
        type: "circle",
        source: "pois",
        paint: {
          "circle-radius": ["case", ["boolean", ["get", "selected"], false], 8, 5],
          "circle-color": [
            "match", ["get", "c"],
            "MOUNTAIN_PASS", "#ffffff",
            "SCENIC_POINT", "#ffffff",
            "FUEL", "#f97316",
            "GASTRO", "#facc15",
            "HOTEL", "#60a5fa",
            "#71717a"
          ],
          "circle-stroke-width": ["case", [">=", ["to-number", ["get", "s"]], 4], 2, 0],
          "circle-stroke-color": "#10b981",
          "circle-opacity": 0.9
        },
      });
    }

    // AUTO-ZOOM TO DATA (So you definitely see the dots)
    if (features.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        // Sample first 50 points to save performance
        features.slice(0, 50).forEach(f => bounds.extend(f.geometry.coordinates));
        map.current.fitBounds(bounds, { padding: 50, maxZoom: 10, animate: false });
    }
  };

  // --- 2. ROUTING ---
  const getRoute = async (coordinates) => {
    if (!coordinates || coordinates.length < 2) return;
    const safeCoords = coordinates.filter(c => Array.isArray(c) && c.length === 2 && !isNaN(c[0]));
    if (safeCoords.length < 2) return;

    const coordString = safeCoords.map(c => c.join(',')).join(';');
    // Hardcode 'exclude=motorway' to ensure cinematic routes avoid highways
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordString}?geometries=geojson&exclude=motorway&access_token=${mapboxgl.accessToken}`;
    
    try {
      const query = await fetch(url);
      const json = await query.json();
      if (!json.routes || json.routes.length === 0) return;
      
      const data = json.routes[0];
      const geojson = { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: data.geometry.coordinates } };
      
      if (map.current && map.current.getSource('route')) map.current.getSource('route').setData(geojson);
      if (onRouteCalculated) onRouteCalculated({ distance: (data.distance/1000).toFixed(1), duration: (data.duration/60).toFixed(0) });
    } catch (e) { console.error(e); }
  };

  // --- 3. INIT ---
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [11.392, 47.269], // Fallback center
      zoom: 5,
      pitch: 0,
      attributionControl: false,
    });

    map.current.on("load", () => {
      if (onMapLoad) onMapLoad(map.current);

      map.current.addSource("route", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } } });
      map.current.addLayer({ id: "route", type: "line", source: "route", layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": "#22d3ee", "line-width": 4, "line-opacity": 0.8 } });

      map.current.on("click", "poi-circles", (e) => {
        const props = e.features[0].properties;
        const coords = e.features[0].geometry.coordinates.slice();
        if (onAddStop) onAddStop({ id: props.id, name: props.n, category: props.c, coordinates: coords });
      });

      map.current.on("mouseenter", "poi-circles", () => map.current.getCanvas().style.cursor = "pointer");
      map.current.on("mouseleave", "poi-circles", () => map.current.getCanvas().style.cursor = "");

      fetchIntel();
    });

    return () => { map.current?.remove(); map.current = null; };
  }, []);

  // --- 4. REACTIVE LOOP ---
  const routeKey = routeWaypoints.map(p => p.id || p.coordinates?.join(',')).join('|');
  const selectedKey = selectedIds.join('|');

  useEffect(() => {
    if (routeWaypoints && routeWaypoints.length >= 2) {
       const coords = routeWaypoints.map(p => {
         if (Array.isArray(p.coordinates)) return p.coordinates;
         return [p.longitude, p.latitude];
       });
       getRoute(coords);
    }
  }, [routeKey, selectedKey]); 

  return <div ref={mapContainer} className="w-full h-full relative bg-zinc-900" />;
}
