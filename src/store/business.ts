'use client';

import { create } from 'zustand';
import type { Business } from '@/types';

interface BusinessState {
  business: Business | null;
  isLoading: boolean;
  setBusiness: (business: Business | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useBusinessStore = create<BusinessState>((set) => ({
  business: null,
  isLoading: true,
  setBusiness: (business) => set({ business }),
  setLoading: (isLoading) => set({ isLoading }),
}));
