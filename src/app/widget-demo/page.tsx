'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { VoiceWidget } from '@/components/voice/VoiceWidget';

function WidgetDemoContent() {
  const searchParams = useSearchParams();
  const businessId = searchParams.get('businessId') || '';

  if (!businessId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-surface-500 text-sm">businessId parameter is required</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-surface-900 mb-2">Widget Demo</h1>
        <p className="text-surface-500 text-sm">The voice widget appears in the bottom right corner</p>
      </div>
      <VoiceWidget businessId={businessId} businessName="Auto Repair" />
    </div>
  );
}

export default function WidgetDemoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-surface-400 text-sm">Loading...</p></div>}>
      <WidgetDemoContent />
    </Suspense>
  );
}
