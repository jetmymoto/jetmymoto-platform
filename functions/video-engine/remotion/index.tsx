import React from "react";
import {Composition, registerRoot} from "remotion";
import {MissionVideo} from "./MissionVideo";

const defaultMission = {
  slug: "ath-to-muc-alpine-return",
  title: "The Alpine Return",
  insertion_airport: "ATH",
  extraction_airport: "MUC",
  subtitle: "Europe's premium rebalancing corridor",
  price_radar: {
    subsidy_pct: 40,
  },
  coordinates: [
    [23.9445, 37.9364],
    [11.7861, 48.3538],
  ],
};

const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MissionVideo"
      component={MissionVideo}
      durationInFrames={660}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        mission: defaultMission,
        mapboxToken: "",
      }}
    />
  );
};

registerRoot(RemotionRoot);