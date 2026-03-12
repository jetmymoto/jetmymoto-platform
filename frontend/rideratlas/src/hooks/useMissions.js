import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export const useMissions = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        // Direct extraction from the master v4 collection
        const q = query(collection(db, "missions_v4"), where("active", "==", true));
        const querySnapshot = await getDocs(q);
        
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log(`✅ SOURCE_v4: ${data.length} Missions Synced`);
        setMissions(data);
      } catch (err) {
        console.error("❌ DATABASE OFFLINE:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMissions();
  }, []);

  return { missions, loading };
};
