import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Map, Settings, ChevronRight, X } from 'lucide-react';

const statusColors = {
  PIPELINE: 'bg-yellow-500/20 text-yellow-400',
  VALIDATION: 'bg-blue-500/20 text-blue-400',
  ACTIVE: 'bg-green-500/20 text-green-400',
  PAUSED: 'bg-orange-500/20 text-orange-400',
  DISABLED: 'bg-red-500/20 text-red-400',
};

const tierColors = {
    TIER_1: 'border-amber-400 text-amber-400',
    TIER_2: 'border-slate-400 text-slate-400',
    TIER_3: 'border-stone-500 text-stone-500',
}

const EditDrawer = ({ airport, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (airport) {
      setFormData({
        status: airport?.status || 'PIPELINE',
        tier: airport?.tier || 'TIER_3',
        corridor: airport?.corridor || '',
        plannerEnabled: airport?.plannerEnabled || false,
        bookingEnabled: airport?.bookingEnabled || false,
        seoEnabled: airport?.seoEnabled || false,
      });
    }
  }, [airport]);

  if (!isOpen || !airport) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = () => {
    onSave(airport.id, formData);
  };
  
  const corridorOptions = [
    "Alpine", "Mediterranean", "Riviera", "Baltic", 
    "Nordic", "Atlantic", "Iberia", "Balkans"
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose}>
      <div
        className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-900 border-l border-white/10 shadow-lg z-50 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Edit Airport: {airport?.code}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-grow p-6 overflow-y-auto space-y-6">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-zinc-400 mb-2">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              {['PIPELINE', 'VALIDATION', 'ACTIVE', 'PAUSED', 'DISABLED'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tier" className="block text-sm font-medium text-zinc-400 mb-2">Tier</label>
            <select
              id="tier"
              name="tier"
              value={formData.tier}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              {['TIER_1', 'TIER_2', 'TIER_3'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="corridor" className="block text-sm font-medium text-zinc-400 mb-2">Corridor</label>
            <select
              id="corridor"
              name="corridor"
              value={formData.corridor}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">Select Corridor</option>
              {corridorOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Planner Enabled</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="plannerEnabled" checked={formData.plannerEnabled} onChange={handleChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-sky-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>
             <div className="flex items-center justify-between">
              <span className="text-zinc-400">Booking Enabled</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="bookingEnabled" checked={formData.bookingEnabled} onChange={handleChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-sky-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>
             <div className="flex items-center justify-between">
              <span className="text-zinc-400">SEO Enabled</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="seoEnabled" checked={formData.seoEnabled} onChange={handleChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-sky-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleSave}
            className="w-full bg-sky-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-sky-500 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};


const AirportExpansionPanel = () => {
  const [airports, setAirports] = useState([]);
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "airports"), (snapshot) => {
      const airportsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("AIRPORTS IN PANEL:", airportsData); // Debug log
      setAirports(airportsData);
    });

    return () => unsubscribe();
  }, []);
  
  const handleEditClick = (airport) => {
    console.log("SELECTED AIRPORT for EDIT:", airport); // Debug log
    setSelectedAirport(airport);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedAirport(null);
  };
  
  const handleSaveChanges = async (id, updatedData) => {
    try {
      const airportDocRef = doc(db, "airports", id);
      await updateDoc(airportDocRef, updatedData);
      handleCloseDrawer();
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };


  return (
    <div className="bg-zinc-900 text-white p-6 rounded-lg h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center">
            <Map className="mr-3" />
            Airport Network Expansion
        </h2>
        <span className="text-xs font-mono text-zinc-500">AdminOS v0.2</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-zinc-400">
          <thead className="text-xs text-zinc-400 uppercase bg-zinc-800/50">
            <tr>
              <th scope="col" className="px-6 py-3">Code</th>
              <th scope="col" className="px-6 py-3">Airport</th>
              <th scope="col" className="px-6 py-3">Country</th>
              <th scope="col" className="px-6 py-3">Tier</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Corridor</th>
              <th scope="col" className="px-6 py-3">Planner</th>
              <th scope="col" className="px-6 py-3">Bookings</th>
              <th scope="col" className="px-6 py-3"><span className="sr-only">Edit</span></th>
            </tr>
          </thead>
          <tbody>
            {airports.map((airport) => (
              <tr key={airport.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                <th scope="row" className="px-6 py-4 font-mono font-medium text-white whitespace-nowrap">{airport?.code}</th>
                <td className="px-6 py-4">{airport?.name}</td>
                <td className="px-6 py-4">{airport?.country}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${tierColors[airport?.tier] || 'border-zinc-600 text-zinc-600'}`}>{airport?.tier || 'N/A'}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[airport?.status] || 'bg-gray-700 text-gray-300'}`}>{airport?.status || 'UNKNOWN'}</span>
                </td>
                <td className="px-6 py-4">{airport?.corridor || 'N/A'}</td>
                <td className="px-6 py-4">{airport?.plannerEnabled ? 'Yes' : 'No'}</td>
                <td className="px-6 py-4">{airport?.bookingEnabled ? 'Yes' : 'No'}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEditClick(airport)} className="font-medium text-sky-500 hover:text-sky-400 flex items-center">
                    <Settings size={14} className="mr-1" />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

       <EditDrawer 
        airport={selectedAirport}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onSave={handleSaveChanges}
      />
    </div>
  );
};

export default AirportExpansionPanel;
