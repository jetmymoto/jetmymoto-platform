import { useEffect, useRef, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "../../firebase";

import LiveFeedCard from "./LiveFeedCard";
import LiveFeedModal from "./LiveFeedModal";
import LiveFeedSkeleton from "./LiveFeedSkeleton";

export default function LiveFeed() {
  const scrollRef = useRef(null);
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const q = query(
        collection(db, "live_feed"),
        orderBy("curation.priority", "asc"),
        limit(12)
      );
      const snap = await getDocs(q);
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    load();
  }, []);

  const scroll = dir =>
    scrollRef.current.scrollBy({
      left: dir === "left" ? -400 : 400,
      behavior: "smooth",
    });

  return (
    <section className="py-24 bg-[#050505]">
      {/* HEADER */}
      <div className="px-6 flex justify-between items-end mb-8">
        <h3 className="text-4xl font-black italic uppercase text-white">
          Field <span className="text-amber-500">Intelligence</span>
        </h3>

        <div className="hidden md:flex gap-2">
          <button onClick={() => scroll("left")} className="btn">
            <ChevronLeft />
          </button>
          <button onClick={() => scroll("right")} className="btn">
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* FEED */}
      {loading ? (
        <LiveFeedSkeleton />
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-6 px-6 overflow-x-auto snap-x snap-mandatory no-scrollbar"
        >
          {items.map(item => (
            <LiveFeedCard
              key={item.id}
              item={item}
              onOpen={setActive}
            />
          ))}
        </div>
      )}

      {active && (
        <LiveFeedModal
          item={active}
          onClose={() => setActive(null)}
        />
      )}
    </section>
  );
}
