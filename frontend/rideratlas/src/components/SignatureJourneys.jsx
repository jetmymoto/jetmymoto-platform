import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import MissionCard from './MissionCard';

const SignatureJourneys = ({ missions = [], onMissionSelect, limit }) => {
  const [liveMissionIds, setLiveMissionIds] = useState(new Set());

  // Check for live signals
  useEffect(() => {
    const fetchLiveSignals = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'live_feed'));
        const ids = new Set();
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.mission_id) ids.add(data.mission_id);
        });
        setLiveMissionIds(ids);
      } catch (e) {
        console.log("Signal check failed", e);
      }
    };
    fetchLiveSignals();
  }, []);

  // Safe slice to prevent undefined errors
  const displayMissions = limit && Array.isArray(missions) 
    ? missions.slice(0, limit) 
    : (Array.isArray(missions) ? missions : []);

  if (!displayMissions || displayMissions.length === 0) {
    return <div className="text-white/50 text-center font-mono">NO MISSIONS DETECTED IN THIS SECTOR</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayMissions.map((mission) => (
        <MissionCard 
          key={mission.id} 
          mission={mission} 
          onClick={onMissionSelect}
          hasLiveFeed={liveMissionIds.has(mission.id) || liveMissionIds.has(mission.title?.toLowerCase().replace(/ /g, '_'))}
        />
      ))}
    </div>
  );
};

export default SignatureJourneys;
