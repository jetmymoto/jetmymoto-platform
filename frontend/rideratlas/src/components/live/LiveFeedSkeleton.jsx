export default function LiveFeedSkeleton() {
  return (
    <div className="flex gap-6 px-6 overflow-x-auto">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex-none w-[85vw] sm:w-[60vw] md:w-[30vw]
                     aspect-[16/10] bg-zinc-800 animate-pulse"
        />
      ))}
    </div>
  );
}
