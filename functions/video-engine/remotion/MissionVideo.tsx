import React from "react";
import {AbsoluteFill} from "remotion";
import {MapComposition} from "./MapComposition";

type MissionProps = {
  mission: {
    slug: string;
    title: string;
    insertion_airport: string;
    extraction_airport: string;
    subtitle?: string;
    subsidyPct?: number;
    price_radar?: {
      subsidy_pct?: number;
    };
    coordinates: Array<[number, number]>;
  };
  mapboxToken: string;
};

export const MissionVideo: React.FC<MissionProps> = ({mission, mapboxToken}) => {
  return (
    <AbsoluteFill style={{backgroundColor: "#020508", color: "white"}}>
      <MapComposition mission={mission} mapboxToken={mapboxToken} />
    </AbsoluteFill>
  );
};