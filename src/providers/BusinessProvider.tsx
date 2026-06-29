'use client';

import { useEffect } from 'react';
import { useBusinessStore } from '@/store/business';
import { getMyBusiness } from '@/services/business';
import { createClient } from '@/lib/supabase/client';

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const { setBusiness, setLoading } = useBusinessStore();

  useEffect(() => {
    setLoading(true);
    getMyBusiness()
      .then((b) => setBusiness(b))
      .catch(() => setBusiness(null))
      .finally(() => setLoading(false));

    // Re-fetch business whenever auth state changes (e.g. session restored)
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        getMyBusiness()
          .then((b) => setBusiness(b))
          .catch(() => {});
      }
    });
    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
