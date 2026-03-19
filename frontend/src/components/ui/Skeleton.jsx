export default function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-(--bg-elevated) ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="space-y-3 rounded-xl bg-(--bg-surface) p-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}
