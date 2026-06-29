'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-red-500" />
      </div>
      <h2 className="text-base font-semibold text-surface-900 mb-2">Something went wrong</h2>
      <p className="text-sm text-surface-500 mb-4 text-center max-w-xs">
        An error occurred while loading this page.
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
