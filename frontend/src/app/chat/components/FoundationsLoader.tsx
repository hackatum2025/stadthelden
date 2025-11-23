import { FoundationCardSkeleton } from "./FoundationCardSkeleton";

export function FoundationsLoader({ message = "Lade Stiftungen" }: { message?: string }) {
  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-8">
      {/* Header Skeleton */}
      <div className="mb-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-md mb-2 w-2/3" />
        <div className="h-5 bg-gray-200 rounded-md w-1/2" />
      </div>

      {/* Foundation Card Skeletons */}
      <div className="space-y-0">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            style={{ animationDelay: `${index * 100}ms` }}
            className="animate-fadeIn"
          >
            <FoundationCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

