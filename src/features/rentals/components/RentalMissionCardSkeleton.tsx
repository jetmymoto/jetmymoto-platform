export default function RentalMissionCardSkeleton() {
  return (
    <div className="relative flex flex-col w-[320px] h-[480px] bg-[#0B0B0C] border border-white/5 overflow-hidden animate-pulse">
      {/* 70% Image Area Skeleton */}
      <div className="h-[70%] bg-white/5" />

      {/* 30% Bottom Panel Skeleton */}
      <div className="h-[30%] p-6 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="h-2 w-16 bg-white/10 rounded" />
          <div className="h-5 w-48 bg-white/10 rounded" />
          <div className="h-2 w-24 bg-white/10 rounded" />
        </div>

        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="h-2 w-12 bg-white/10 rounded" />
            <div className="h-4 w-20 bg-white/10 rounded" />
          </div>
          <div className="h-8 w-24 bg-[#CDA755]/20 rounded" />
        </div>
      </div>
    </div>
  );
}
