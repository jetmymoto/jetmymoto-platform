import AirportExpansionPanel from "../../components/admin/AirportExpansionPanel";
import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInAnonymously
} from "firebase/auth";
import { db, auth } from "@/lib/firebase";

import {
  LayoutDashboard,
  Map,
  Users,
  Package,
  Search,
  ChevronRight,
  Plane,
  Truck,
  ShieldCheck,
  Activity,
  Clock,
  X,
  Zap
} from "lucide-react";

//////////////////////////////////////////////////////
// FIREBASE
//////////////////////////////////////////////////////



const appId =
  typeof __app_id !== "undefined" ? __app_id : "default-app-id";

const getPath = (col) => `/artifacts/${appId}/public/data/${col}`;

//////////////////////////////////////////////////////
// CONSTANTS
//////////////////////////////////////////////////////

const PIPELINE_STAGES = [
  "NEW",
  "CONTACTED",
  "SCHEDULED",
  "IN_TRANSIT",
  "COMPLETED"
];

//////////////////////////////////////////////////////
// UI COMPONENTS
//////////////////////////////////////////////////////

const StatusBadge = ({ status }) => {
  const styles = {
    NEW: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    CONTACTED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    SCHEDULED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    IN_TRANSIT: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    COMPLETED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-sm border text-[9px] font-mono font-black uppercase tracking-widest ${
        styles[status] || styles.NEW
      }`}
    >
      {status}
    </span>
  );
};

const MetricCard = ({ label, value, icon: Icon }) => (
  <div className="bg-zinc-900 border border-white/5 p-6 rounded-sm space-y-4">
    <Icon size={18} className="text-amber-500" />
    <div>
      <div className="text-2xl font-mono font-black text-white">
        {value}
      </div>
      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest italic">
        {label}
      </div>
    </div>
  </div>
);

//////////////////////////////////////////////////////
// AUTH GUARD
//////////////////////////////////////////////////////

const AdminGuard = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    signInAnonymously(auth);

    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-600">
        Loading Admin OS...
      </div>
    );
  }

  return user ? children : <Navigate to="/" />;
};

//////////////////////////////////////////////////////
// BOOKINGS MODULE
//////////////////////////////////////////////////////

const BookingsModule = ({ bookings, onSelect }) => {
  const metrics = useMemo(() => {
    const active = bookings.filter(
      (b) => b.status !== "COMPLETED"
    ).length;

    return {
      active,
      total: bookings.length
    };
  }, [bookings]);

  return (
    <div className="space-y-10">

      <div>
        <h2 className="text-4xl font-black italic text-white">
          Logistics Pipeline
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <MetricCard label="Active Requests" value={metrics.active} icon={Package}/>
        <MetricCard label="Total Requests" value={metrics.total} icon={Zap}/>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5">
              {["Ref","Client","Payload","Route","Status"].map((h)=>(
                <th key={h} className="p-4 text-[10px] text-zinc-500 font-mono uppercase">
                  {h}
                </th>
              ))}
              <th></th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((b)=>(
              <tr key={b.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 text-amber-500 font-mono">
                  {b.bookingRef || b.id.substring(0,8)}
                </td>

                <td className="p-4">
                  <div className="text-white text-sm">{b.name}</div>
                  <div className="text-zinc-500 text-xs">{b.email}</div>
                </td>

                <td className="p-4 text-sm text-zinc-300 uppercase">
                  {b.bike}
                </td>

                <td className="p-4 text-xs text-zinc-500">
                  {b.from} → {b.to}
                </td>

                <td className="p-4">
                  <StatusBadge status={b.status}/>
                </td>

                <td className="p-4 text-right">
                  <button
                    onClick={()=>onSelect(b)}
                    className="text-zinc-500 hover:text-amber-500"
                  >
                    <ChevronRight/>
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

//////////////////////////////////////////////////////
// PLANNER MODULE
//////////////////////////////////////////////////////

const PlannerModule = ({ plans }) => (
  <div className="space-y-10">

    <h2 className="text-4xl font-black italic text-white">
      Planner Runs
    </h2>

    <div className="grid lg:grid-cols-2 gap-6">

      {plans.map((p)=>(
        <div key={p.id} className="bg-zinc-900 border border-white/5 p-6 rounded-sm">

          <div className="flex justify-between mb-4">
            <span className="text-amber-500 font-mono">{p.id.substring(0,8)}</span>
            <StatusBadge status={p.status || "ACTIVE"} />
          </div>

          <div className="text-white font-bold">
            {p.origin} → {p.destination}
          </div>

          <div className="text-xs text-zinc-500 mt-2">
            {p.days} day ride
          </div>

        </div>
      ))}

    </div>
  </div>
);

//////////////////////////////////////////////////////
// AIRPORT NETWORK
//////////////////////////////////////////////////////

const InfrastructureModule = ({ airports }) => (
  <div className="space-y-10">

    <h2 className="text-4xl font-black italic text-white">
      Airport Network
    </h2>

    <div className="grid grid-cols-2 gap-6">

      {airports.map((a)=>(
        <div key={a.id} className="bg-zinc-900 border border-white/5 p-6 rounded-sm">

          <div className="text-xl font-mono text-zinc-300">
            {a.code}
          </div>

          <div className="text-white font-bold">
            {a.name}
          </div>

          <div className="text-xs text-zinc-500">
            {a.country}
          </div>

        </div>
      ))}

    </div>
  </div>
);

//////////////////////////////////////////////////////
// CRM MODULE
//////////////////////////////////////////////////////

const CRMModule = ({ crm }) => (
  <div className="space-y-10">

    <h2 className="text-4xl font-black italic text-white">
      Rider Intelligence
    </h2>

    <div className="bg-zinc-900 border border-white/5 rounded-sm">

      {crm.map((c)=>(
        <div key={c.id} className="p-4 border-b border-white/5">

          <div className="text-white">
            {c.identity?.email || c.id}
          </div>

          <div className="text-xs text-zinc-500">
            stage: {c.leadStage}
          </div>

        </div>
      ))}

    </div>

  </div>
);

//////////////////////////////////////////////////////
// MAIN DASHBOARD
//////////////////////////////////////////////////////

const CommandDashboard = () => {

  const [activeModule,setActiveModule]=useState("bookings")

  const [bookings,setBookings]=useState([])
  const [plans,setPlans]=useState([])
  const [airports,setAirports]=useState([])
  const [crm,setCrm]=useState([])

  const [selected,setSelected]=useState(null)

  useEffect(()=>{

    const unsubBookings = onSnapshot(
      collection(db,getPath("bookings")),
      snap => setBookings(snap.docs.map(d=>({id:d.id,...d.data()})))
    )

    const unsubPlans = onSnapshot(
      collection(db,getPath("plans")),
      snap => setPlans(snap.docs.map(d=>({id:d.id,...d.data()})))
    )

    const unsubAirports = onSnapshot(
      collection(db,getPath("airports")),
      snap => setAirports(snap.docs.map(d=>({id:d.id,...d.data()})))
    )

    const unsubCRM = onSnapshot(
      collection(db,getPath("crm_leads")),
      snap => setCrm(snap.docs.map(d=>({id:d.id,...d.data()})))
    )

    return ()=>{
      unsubBookings()
      unsubPlans()
      unsubAirports()
      unsubCRM()
    }

  },[])

  return (

<div className="min-h-screen bg-[#050505] text-zinc-100 flex">

{/* SIDEBAR */}

<aside className="w-64 bg-zinc-950 border-r border-white/5 p-6 space-y-4">

<div className="text-white font-black text-lg">Admin OS</div>

{[
{ id:"bookings",label:"Pipeline",icon:LayoutDashboard },
{ id:"planner",label:"Planner",icon:Plane },
{ id:"network",label:"Network",icon:Map },
{ id:"crm",label:"CRM",icon:Users }
].map(item=>(
<button
key={item.id}
onClick={()=>setActiveModule(item.id)}
className={`flex gap-3 items-center p-3 w-full text-left rounded-sm ${
activeModule===item.id
? "bg-amber-500 text-black"
: "text-zinc-500 hover:text-white"
}`}
>
<item.icon size={18}/>
{item.label}
</button>
))}

</aside>

{/* CONTENT */}

<main className="flex-1 p-10">

{activeModule==="bookings" &&
<BookingsModule bookings={bookings} onSelect={setSelected}/>
}

{activeModule==="planner" &&
<PlannerModule plans={plans}/>
}

{activeModule==="network" &&
<AirportExpansionPanel />
}

{activeModule==="crm" &&
<CRMModule crm={crm}/>
}

</main>

</div>
  )
}

//////////////////////////////////////////////////////
// ROUTER
//////////////////////////////////////////////////////

export default function AdminOS(){

return(

<Routes>
  <SeoHelmet
    title="Admin OS | JetMyMoto"
    description="Operating System for JetMyMoto administration."
    canonicalUrl="https://jetmymoto.com/admin/os"
    noIndex={true}
  />
<Route
path="/admin/os"
element={
<AdminGuard>
<CommandDashboard/>
</AdminGuard>
}
/>

<Route path="/admin" element={<Navigate to="/admin/os"/>}/>

</Routes>

)
}
