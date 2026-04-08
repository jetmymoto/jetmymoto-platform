import React, { useEffect, useMemo, useState } from 'react';
import {
  collection,
  query,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  orderBy,
  limit as fsLimit,
} from 'firebase/firestore';
import SeoHelmet from '../components/seo/SeoHelmet'; // Import SeoHelmet
import NetworkPanel from '../components/admin/NetworkPanel';
import { db } from '@/lib/firebase';
import {
  LayoutDashboard,
  Plus,
  AlertTriangle,
  Search,
  X,
  Save,
  Youtube,
  Database,
  Trash2,
  Film,
  Radio,
  ClipboardList,
  Activity,
  ShieldCheck,
  ExternalLink,
  Network,
} from 'lucide-react';

/* ----------------------------------
  HELPERS
---------------------------------- */

const safeStr = (v) => (typeof v === 'string' ? v : '');

const asArray = (v) => (Array.isArray(v) ? v.filter(Boolean) : []);

const normalizeMissionId = (s) =>
  safeStr(s).trim().toLowerCase().replace(/\s+/g, '_');

const normalizeDocId = (s) =>
  safeStr(s).trim().toLowerCase().replace(/\s+/g, '_');

function extractYouTubeId(input) {
  const v = safeStr(input).trim();
  if (!v) return '';
  // If they pasted just the ID
  if (/^[a-zA-Z0-9_-]{6,}$/.test(v) && !v.includes('http')) return v;

  try {
    const u = new URL(v);
    // youtu.be/<id>
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '');
      return id || '';
    }
    // youtube.com/watch?v=<id>
    if (u.searchParams.get('v')) return u.searchParams.get('v') || '';
    // youtube.com/shorts/<id>
    const parts = u.pathname.split('/').filter(Boolean);
    const shortsIdx = parts.indexOf('shorts');
    if (shortsIdx !== -1 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];
    // youtube.com/embed/<id>
    const embedIdx = parts.indexOf('embed');
    if (embedIdx !== -1 && parts[embedIdx + 1]) return parts[embedIdx + 1];

    return '';
  } catch {
    return '';
  }
}

const ytThumb = (videoId) =>
  videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';

const ytWatch = (videoId) =>
  videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';

const ytEmbed = (videoId) =>
  videoId
    ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
    : '';

/* ----------------------------------
  UI: TABS
---------------------------------- */

const TABS = [
  { id: 'MISSIONS', label: 'Missions DB', icon: <Database size={16} /> },
  { id: 'LIVE', label: 'Live Feed Intel', icon: <Radio size={16} /> },
  { id: 'NETWORK', label: 'Airport Network', icon: <Network size={16} /> },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('MISSIONS');

  /* ----------------------------------
    MISSIONS STATE
  ---------------------------------- */

  const [missions, setMissions] = useState([]);
  const [missionsLoading, setMissionsLoading] = useState(true);
  const [missionSearch, setMissionSearch] = useState('');
  const [selectedMission, setSelectedMission] = useState(null);
  const [isCreatingMission, setIsCreatingMission] = useState(false);
  const [missionDeleteConfirm, setMissionDeleteConfirm] = useState(null);

  // mission form
  const [missionId, setMissionId] = useState('');
  const [title, setTitle] = useState('');
  const [region, setRegion] = useState('');
  const [description, setDescription] = useState('');
  const [heroLoop, setHeroLoop] = useState('');
  const [videoOrbit, setVideoOrbit] = useState('');

  /* ----------------------------------
    LIVE FEED STATE
  ---------------------------------- */

  const [liveItems, setLiveItems] = useState([]);
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveSearch, setLiveSearch] = useState('');
  const [selectedLive, setSelectedLive] = useState(null);
  const [isCreatingLive, setIsCreatingLive] = useState(false);
  const [liveDeleteConfirm, setLiveDeleteConfirm] = useState(null);

  // live feed form
  const [liveVideoInput, setLiveVideoInput] = useState(''); // url or id
  const [liveVideoId, setLiveVideoId] = useState('');
  const [liveMissionId, setLiveMissionId] = useState('');
  const [liveSummary, setLiveSummary] = useState('');
  const [liveBulletsText, setLiveBulletsText] = useState(''); // newline separated
  const [liveStatus, setLiveStatus] = useState('curated'); // curated/live/draft
  const [livePriority, setLivePriority] = useState(2);
  const [liveConfidence, setLiveConfidence] = useState(0.8);

  /* ----------------------------------
    FETCHERS
  ---------------------------------- */

  const fetchMissions = async () => {
    setMissionsLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'missions_v4')));
      setMissions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error('fetchMissions error:', e);
      alert('MISSIONS FETCH FAILED (check Firestore rules / auth)');
    } finally {
      setMissionsLoading(false);
    }
  };

  const fetchLive = async () => {
    setLiveLoading(true);
    try {
      const q = query(
        collection(db, 'live_feed'),
        orderBy('curation.priority', 'asc'),
        fsLimit(200)
      );
      const snap = await getDocs(q);
      setLiveItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error('fetchLive error:', e);
      alert('LIVE_FEED FETCH FAILED (check Firestore rules / auth)');
    } finally {
      setLiveLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
    fetchLive();
  }, []);

  /* ----------------------------------
    MISSIONS: ACTIONS
  ---------------------------------- */

  const resetMissionForm = () => {
    setSelectedMission(null);
    setIsCreatingMission(false);
    setMissionId('');
    setTitle('');
    setRegion('');
    setDescription('');
    setHeroLoop('');
    setVideoOrbit('');
  };

  const openMission = (m) => {
    setSelectedMission(m);
    setIsCreatingMission(false);
    setMissionId(m?.id || '');
    setTitle(m?.title || '');
    setRegion(m?.region_id || '');
    setDescription(m?.intel?.description || m?.intel?.story || '');
    setHeroLoop(m?.media?.hero_loop || '');
    setVideoOrbit(m?.media?.video_orbit || '');
  };

  const handleSaveMission = async () => {
    const idToUse = isCreatingMission
      ? normalizeDocId(missionId)
      : selectedMission?.id;

    if (!idToUse) return alert('MISSION ID REQUIRED');

    const payload = {
      title: safeStr(title),
      region_id: normalizeMissionId(region),
      intel: {
        // keep both safe — backend tolerant
        description: safeStr(description),
        story: safeStr(description),
      },
      media: {
        hero_loop: safeStr(heroLoop),
        video_orbit: safeStr(videoOrbit),
      },
      curation_status: 'BATTLE_READY',
      last_updated: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'missions_v4', idToUse), payload, { merge: true });
      alert(`🛰️ MISSION UPDATED: ${idToUse}`);
      resetMissionForm();
      fetchMissions();
    } catch (e) {
      console.error('handleSaveMission error:', e);
      alert('DATABASE REJECTION (missions_v4 write blocked?)');
    }
  };

  const handleDeleteMission = async (id) => {
    try {
      await deleteDoc(doc(db, 'missions_v4', id));
      setMissionDeleteConfirm(null);
      fetchMissions();
    } catch (e) {
      console.error('delete mission error:', e);
      alert('DELETE FAILED (missions_v4 write blocked?)');
    }
  };

  /* ----------------------------------
    LIVE FEED: ACTIONS
  ---------------------------------- */

  const resetLiveForm = () => {
    setSelectedLive(null);
    setIsCreatingLive(false);
    setLiveVideoInput('');
    setLiveVideoId('');
    setLiveMissionId('');
    setLiveSummary('');
    setLiveBulletsText('');
    setLiveStatus('curated');
    setLivePriority(2);
    setLiveConfidence(0.8);
  };

  const openLive = (item) => {
    setSelectedLive(item);
    setIsCreatingLive(false);

    const vid = item?.video_id || item?.id || '';
    setLiveVideoInput(vid);
    setLiveVideoId(vid);

    setLiveMissionId(item?.mission_id || '');
    setLiveSummary(item?.notebooklm?.summary_1line || item?.summary_1line || '');
    const bullets =
      asArray(item?.notebooklm?.analysis_bullets).length
        ? asArray(item?.notebooklm?.analysis_bullets)
        : asArray(item?.notebooklm?.summary_bullets);

    setLiveBulletsText(bullets.join('\n'));
    setLiveStatus(item?.curation?.status || 'curated');
    setLivePriority(Number(item?.curation?.priority ?? 2));
    setLiveConfidence(
      typeof item?.confidence === 'number' ? item.confidence : 0.8
    );
  };

  useEffect(() => {
    const id = extractYouTubeId(liveVideoInput);
    setLiveVideoId(id);
  }, [liveVideoInput]);

  const handleSaveLive = async () => {
    const videoId = extractYouTubeId(liveVideoInput) || safeStr(liveVideoId);
    if (!videoId) return alert('YOUTUBE VIDEO ID / URL REQUIRED');
    const mid = normalizeMissionId(liveMissionId);
    if (!mid) return alert('MISSION_ID REQUIRED (links intel -> mission)');

    const bullets = liveBulletsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      video_id: videoId,
      mission_id: mid, // CRITICAL FK
      curation: {
        status: safeStr(liveStatus) || 'curated',
        priority: Number(livePriority) || 2,
        timestamp: new Date().toISOString(),
      },
      notebooklm: {
        summary_1line: safeStr(liveSummary),
        analysis_bullets: bullets,
      },
      summary_1line: safeStr(liveSummary), // optional convenience
      confidence:
        typeof liveConfidence === 'number'
          ? Math.max(0, Math.min(1, liveConfidence))
          : 0.8,
    };

    try {
      await setDoc(doc(db, 'live_feed', videoId), payload, { merge: true });
      alert(`📡 LIVE FEED UPDATED: ${videoId}`);
      resetLiveForm();
      fetchLive();
    } catch (e) {
      console.error('handleSaveLive error:', e);
      alert('DATABASE REJECTION (live_feed write blocked?)');
    }
  };

  const handleDeleteLive = async (videoId) => {
    try {
      await deleteDoc(doc(db, 'live_feed', videoId));
      setLiveDeleteConfirm(null);
      fetchLive();
    } catch (e) {
      console.error('delete live error:', e);
      alert('DELETE FAILED (live_feed write blocked?)');
    }
  };

  /* ----------------------------------
    FILTERS
  ---------------------------------- */

  const filteredMissions = useMemo(() => {
    const t = missionSearch.trim().toLowerCase();
    if (!t) return missions;
    return missions.filter(
      (m) =>
        m.id?.toLowerCase().includes(t) ||
        m.title?.toLowerCase().includes(t) ||
        m.region_id?.toLowerCase().includes(t)
    );
  }, [missions, missionSearch]);

  const filteredLive = useMemo(() => {
    const t = liveSearch.trim().toLowerCase();
    if (!t) return liveItems;
    return liveItems.filter((i) => {
      const vid = (i.video_id || i.id || '').toLowerCase();
      const mid = (i.mission_id || '').toLowerCase();
      const sum =
        (i.notebooklm?.summary_1line || i.summary_1line || '').toLowerCase();
      return vid.includes(t) || mid.includes(t) || sum.includes(t);
    });
  }, [liveItems, liveSearch]);

  /* ----------------------------------
    LOADING UI
  ---------------------------------- */

  const pageLoading = missionsLoading && liveLoading;

  if (pageLoading) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center text-amber-500 font-mono italic animate-pulse">
        ESTABLISHING_SATELLITE_LINK...
      </div>
    );
  }

  /* ----------------------------------
    RENDER
  ---------------------------------- */

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 pb-32">
      <SeoHelmet
        title="Admin Dashboard | JetMyMoto"
        description="Admin panel for managing JetMyMoto operations."
        canonicalUrl="https://jetmymoto.com/admin"
        noIndex={true}
      />
      {/* HEADER */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter flex items-center gap-4">
            <LayoutDashboard className="text-amber-500" size={44} /> Command
          </h1>
          <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.4em] mt-2">
            missions_v4: {missions.length} · live_feed: {liveItems.length}
          </p>
        </div>

        {/* TAB SWITCH */}
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-xs font-mono uppercase tracking-widest border transition flex items-center gap-2
                ${
                  tab === t.id
                    ? 'bg-amber-500 text-black border-amber-500'
                    : 'border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* CREATE BTN */}
        {tab === 'MISSIONS' ? (
          <button
            onClick={() => {
              resetMissionForm();
              setIsCreatingMission(true);
              setSelectedMission({ id: '' }); // keeps modal open safely
            }}
            className="bg-amber-500 text-black px-8 py-4 font-black uppercase text-xs flex items-center gap-2 hover:bg-white transition-all shadow-xl active:scale-95"
          >
            <Plus size={18} /> New Mission
          </button>
        ) : (
          <button
            onClick={() => {
              resetLiveForm();
              setIsCreatingLive(true);
              setSelectedLive({ id: '' });
            }}
            className="bg-amber-500 text-black px-8 py-4 font-black uppercase text-xs flex items-center gap-2 hover:bg-white transition-all shadow-xl active:scale-95"
          >
            <Plus size={18} /> New Live Intel
          </button>
        )}
      </header>

      {/* SEARCH */}
      <div className="mb-8 relative">
        <Search
          className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"
          size={20}
        />
        {tab === 'MISSIONS' ? (
          <input
            type="text"
            placeholder="FILTER MISSIONS BY ID / TITLE / REGION..."
            className="w-full bg-[#0a0a0a] border border-white/10 p-6 pl-14 font-mono text-sm focus:border-amber-500 outline-none uppercase"
            value={missionSearch}
            onChange={(e) => setMissionSearch(e.target.value)}
          />
        ) : (
          <input
            type="text"
            placeholder="FILTER LIVE FEED BY VIDEO_ID / MISSION_ID / SUMMARY..."
            className="w-full bg-[#0a0a0a] border border-white/10 p-6 pl-14 font-mono text-sm focus:border-amber-500 outline-none uppercase"
            value={liveSearch}
            onChange={(e) => setLiveSearch(e.target.value)}
          />
        )}
      </div>

      {/* LIST GRID */}
      {tab === 'MISSIONS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredMissions.map((m) => (
            <div
              key={m.id}
              className="bg-[#0a0a0a] border border-white/5 p-5 flex justify-between items-center hover:border-amber-500/40 transition-all group"
            >
              <div
                className="flex gap-4 items-center cursor-pointer"
                onClick={() => openMission(m)}
              >
                <div
                  className={`w-1 h-10 ${
                    m.media?.video_orbit ? 'bg-green-500' : 'bg-red-500 animate-pulse'
                  }`}
                />
                <div>
                  <div className="font-mono text-[9px] text-gray-600 uppercase">
                    {m.id}
                  </div>
                  <h3 className="text-sm font-bold uppercase truncate w-48">
                    {m.title || 'UNTITLED'}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setMissionDeleteConfirm(m.id)}
                className="p-2 text-gray-800 hover:text-red-500 transition-colors"
                title="Delete mission"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : tab === 'LIVE' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredLive.map((i) => {
            const vid = i.video_id || i.id;
            const mid = i.mission_id || 'unknown_sector';
            const sum = i.notebooklm?.summary_1line || i.summary_1line || '';
            const thumb = ytThumb(vid);

            return (
              <div
                key={i.id}
                className="bg-[#0a0a0a] border border-white/5 p-5 flex justify-between items-center hover:border-amber-500/40 transition-all group"
              >
                <div
                  className="flex gap-4 items-center cursor-pointer min-w-0"
                  onClick={() => openLive(i)}
                >
                  <div className="w-12 h-10 bg-[#050505] border border-white/10 overflow-hidden flex-none">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt="thumb"
                        className="w-full h-full object-cover opacity-80"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30">
                        <Youtube size={18} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="font-mono text-[9px] text-gray-600 uppercase truncate">
                      {vid || 'NO_VIDEO_ID'}
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold uppercase truncate">
                        {mid}
                      </h3>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-amber-500 flex items-center gap-1">
                        <Activity size={12} /> {i.curation?.status || 'curated'}
                      </span>
                    </div>
                    {sum ? (
                      <div className="text-xs text-gray-400 line-clamp-2 mt-1">
                        “{sum}”
                      </div>
                    ) : (
                      <div className="text-xs text-gray-600 mt-1">
                        AI summary pending
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setLiveDeleteConfirm(vid)}
                  className="p-2 text-gray-800 hover:text-red-500 transition-colors"
                  title="Delete live intel"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <NetworkPanel />
      )}

      {/* ----------------------------------
        MISSIONS MODAL
      ---------------------------------- */}
      {selectedMission && tab === 'MISSIONS' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#050505]/95 backdrop-blur-md">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-6xl p-10 relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={resetMissionForm}
              className="absolute top-6 right-6 text-gray-500 hover:text-white"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-3 mb-10 text-amber-500">
              <Database size={24} />
              <h2 className="text-3xl font-black uppercase">
                {isCreatingMission ? 'Deploy New Sector' : `Refine: ${selectedMission.id}`}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                {isCreatingMission && (
                  <div>
                    <label className="block font-mono text-[10px] text-amber-500 uppercase mb-2">
                      Unique ID (slug)
                    </label>
                    <input
                      className="w-full bg-[#050505] border border-white/10 p-4 font-mono text-white"
                      value={missionId}
                      onChange={(e) => setMissionId(e.target.value)}
                      placeholder="e.g. grossglockner_alpine_run"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-mono text-[10px] text-gray-500 uppercase mb-2">
                    Title
                  </label>
                  <input
                    className="w-full bg-[#050505] border border-white/10 p-4 font-bold text-white uppercase"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-gray-500 uppercase mb-2">
                    Region (region_id)
                  </label>
                  <input
                    className="w-full bg-[#050505] border border-white/10 p-4 font-mono text-white uppercase"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="e.g. alps"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-gray-500 uppercase mb-2">
                    Intel (Cinematic Brief)
                  </label>
                  <textarea
                    className="w-full h-56 bg-[#050505] border border-white/10 p-5 text-gray-300 text-sm leading-relaxed"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-6 bg-white/5 p-8 border border-white/5">
                <div>
                  <label className="flex items-center gap-2 font-mono text-[10px] text-amber-500 uppercase mb-2">
                    <Film size={14} /> Hero Loop (mp4)
                  </label>
                  <input
                    className="w-full bg-[#050505] border border-white/10 p-4 font-mono text-xs text-amber-400"
                    value={heroLoop}
                    onChange={(e) => setHeroLoop(e.target.value)}
                    placeholder="https://firebasestorage.googleapis.../intro.mp4"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 font-mono text-[10px] text-red-500 uppercase mb-2">
                    <Youtube size={14} /> Video Orbit (YouTube / optional)
                  </label>
                  <input
                    className="w-full bg-[#050505] border border-white/10 p-4 font-mono text-xs text-red-400"
                    value={videoOrbit}
                    onChange={(e) => setVideoOrbit(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div className="pt-8">
                  <button
                    onClick={handleSaveMission}
                    className="w-full bg-amber-500 text-black py-6 font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white transition-all"
                  >
                    <Save size={18} /> Sync Mission
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------
        LIVE FEED MODAL
      ---------------------------------- */}
      {selectedLive && tab === 'LIVE' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#050505]/95 backdrop-blur-md">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-6xl p-10 relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={resetLiveForm}
              className="absolute top-6 right-6 text-gray-500 hover:text-white"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-3 mb-8 text-amber-500">
              <Radio size={24} />
              <h2 className="text-3xl font-black uppercase">
                {isCreatingLive ? 'Deploy Live Intel' : `Edit Intel: ${selectedLive.video_id || selectedLive.id || ''}`}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* LEFT: FIELDS */}
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 font-mono text-[10px] text-red-500 uppercase mb-2">
                    <Youtube size={14} /> YouTube URL or Video ID
                  </label>
                  <input
                    className="w-full bg-[#050505] border border-white/10 p-4 font-mono text-sm text-white"
                    value={liveVideoInput}
                    onChange={(e) => setLiveVideoInput(e.target.value)}
                    placeholder="https://youtube.com/watch?v=...  OR  dQw4w9WgXcQ"
                  />
                  <div className="mt-2 text-[10px] font-mono uppercase tracking-widest text-gray-500">
                    Parsed video_id: <span className="text-amber-500">{liveVideoId || '—'}</span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 font-mono text-[10px] text-gray-500 uppercase mb-2">
                    <Database size={14} /> mission_id (FK to missions_v4)
                  </label>
                  <input
                    className="w-full bg-[#050505] border border-white/10 p-4 font-mono text-sm text-white"
                    value={liveMissionId}
                    onChange={(e) => setLiveMissionId(e.target.value)}
                    placeholder="e.g. grossglockner_alpine_run"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 font-mono text-[10px] text-amber-500 uppercase mb-2">
                    <ClipboardList size={14} /> summary_1line
                  </label>
                  <textarea
                    className="w-full h-28 bg-[#050505] border border-white/10 p-4 text-gray-200 text-sm leading-relaxed"
                    value={liveSummary}
                    onChange={(e) => setLiveSummary(e.target.value)}
                    placeholder='e.g. "High RPM action on the iconic eastern ramp."'
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 font-mono text-[10px] text-amber-500 uppercase mb-2">
                    <ShieldCheck size={14} /> analysis_bullets (one per line)
                  </label>
                  <textarea
                    className="w-full h-44 bg-[#050505] border border-white/10 p-4 text-gray-200 text-sm leading-relaxed"
                    value={liveBulletsText}
                    onChange={(e) => setLiveBulletsText(e.target.value)}
                    placeholder={'Corner density high\nSurface grip varies with altitude\nTraffic low outside peak hours'}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] text-gray-500 uppercase mb-2">
                      status
                    </label>
                    <select
                      className="w-full bg-[#050505] border border-white/10 p-4 font-mono text-sm text-white"
                      value={liveStatus}
                      onChange={(e) => setLiveStatus(e.target.value)}
                    >
                      <option value="draft">draft</option>
                      <option value="curated">curated</option>
                      <option value="live">live</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] text-gray-500 uppercase mb-2">
                      priority
                    </label>
                    <input
                      type="number"
                      className="w-full bg-[#050505] border border-white/10 p-4 font-mono text-sm text-white"
                      value={livePriority}
                      onChange={(e) => setLivePriority(Number(e.target.value))}
                      min={1}
                      max={10}
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] text-gray-500 uppercase mb-2">
                      confidence (0–1)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full bg-[#050505] border border-white/10 p-4 font-mono text-sm text-white"
                      value={liveConfidence}
                      onChange={(e) => setLiveConfidence(Number(e.target.value))}
                      min={0}
                      max={1}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveLive}
                    className="w-full bg-amber-500 text-black py-6 font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white transition-all"
                  >
                    <Save size={18} /> Sync Live Intel
                  </button>
                </div>
              </div>

              {/* RIGHT: PREVIEW */}
              <div className="space-y-6 bg-white/5 p-8 border border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-500">
                    <Activity size={18} />
                    <div className="font-mono text-xs uppercase tracking-widest">
                      Preview
                    </div>
                  </div>

                  {liveVideoId ? (
                    <a
                      href={ytWatch(liveVideoId)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono uppercase tracking-widest text-gray-400 hover:text-white flex items-center gap-2"
                      title="Open on YouTube"
                    >
                      Open <ExternalLink size={14} />
                    </a>
                  ) : null}
                </div>

                <div className="w-full aspect-video bg-[#050505] border border-white/10 overflow-hidden">
                  {liveVideoId ? (
                    <iframe
                      src={ytEmbed(liveVideoId)}
                      title="YouTube Preview"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 font-mono text-xs uppercase tracking-widest">
                      Paste a YouTube URL / ID
                    </div>
                  )}
                </div>

                <div className="w-full h-44 bg-[#050505] border border-white/10 overflow-hidden">
                  {liveVideoId ? (
                    <img
                      src={ytThumb(liveVideoId)}
                      alt="Thumbnail"
                      className="w-full h-full object-cover opacity-80"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 font-mono text-xs uppercase tracking-widest">
                      Thumbnail Preview
                    </div>
                  )}
                </div>

                <div className="border border-white/10 p-5 bg-[#050505]/30">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">
                    Card Preview (what users see)
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-amber-500">
                      {liveStatus === 'live' ? 'LIVE SIGNAL' : 'VERIFIED MISSION'}
                    </span>
                    <Activity size={14} className="text-amber-500/70" />
                  </div>
                  <div className="text-xs font-mono uppercase text-gray-500 mb-2">
                    Mission: {normalizeMissionId(liveMissionId) || 'Unknown Sector'}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    “{liveSummary || 'AI analysis pending. Footage verified.'}”
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------
        DELETE CONFIRM: MISSIONS
      ---------------------------------- */}
      {missionDeleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#050505]/98 p-6 backdrop-blur-2xl">
          <div className="bg-[#0a0a0a] border border-red-500 p-12 max-w-md w-full text-center">
            <AlertTriangle className="text-red-500 mx-auto mb-6 animate-pulse" size={54} />
            <h2 className="text-2xl font-black uppercase text-white mb-2">
              Purge Mission?
            </h2>
            <p className="text-gray-500 font-mono text-xs mb-10">
              Deleting: {missionDeleteConfirm}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setMissionDeleteConfirm(null)}
                className="flex-1 border border-white/10 py-4 font-bold text-xs"
              >
                Abort
              </button>
              <button
                onClick={() => handleDeleteMission(missionDeleteConfirm)}
                className="flex-1 bg-red-600 text-white py-4 font-bold text-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------
        DELETE CONFIRM: LIVE FEED
      ---------------------------------- */}
      {liveDeleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#050505]/98 p-6 backdrop-blur-2xl">
          <div className="bg-[#0a0a0a] border border-red-500 p-12 max-w-md w-full text-center">
            <AlertTriangle className="text-red-500 mx-auto mb-6 animate-pulse" size={54} />
            <h2 className="text-2xl font-black uppercase text-white mb-2">
              Purge Live Intel?
            </h2>
            <p className="text-gray-500 font-mono text-xs mb-10">
              Deleting: {liveDeleteConfirm}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setLiveDeleteConfirm(null)}
                className="flex-1 border border-white/10 py-4 font-bold text-xs"
              >
                Abort
              </button>
              <button
                onClick={() => handleDeleteLive(liveDeleteConfirm)}
                className="flex-1 bg-red-600 text-white py-4 font-bold text-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
