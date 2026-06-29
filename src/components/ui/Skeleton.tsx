import { cn } from '@/lib/utils';

interface SkeletonProps { className?: string; }

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded-md', className)} style={{ background: 'rgba(255,255,255,0.06)' }} />;
}

export function SkeletonCard() {
  return (
    <div className="card-surface p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-5 w-14 rounded-md" />
      </div>
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr>
      <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
      <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
    </tr>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card-surface overflow-hidden">
      <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Skeleton className="h-4 w-36" />
      </div>
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} />)}
        </tbody>
      </table>
    </div>
  );
}
