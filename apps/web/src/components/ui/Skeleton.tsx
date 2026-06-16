export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-neutral-200 to-neutral-100 rounded-md ${className}`}
    />
  );
}
