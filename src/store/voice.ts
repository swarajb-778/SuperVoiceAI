'use client';

import { create } from 'zustand';
import type { VoiceConnectionState, TranscriptEntry } from '@/types';

interface VoiceState {
  connectionState: VoiceConnectionState;
  transcript: TranscriptEntry[];
  isMuted: boolean;
  conversationId: string | null;
  setConnectionState: (state: VoiceConnectionState) => void;
  addTranscriptEntry: (entry: TranscriptEntry) => void;
  updateLastEntry: (content: string) => void;
  clearTranscript: () => void;
  setMuted: (muted: boolean) => void;
  setConversationId: (id: string | null) => void;
  reset: () => void;
}

export const useVoiceStore = create<VoiceState>((set) => ({
  connectionState: { status: 'idle' },
  transcript: [],
  isMuted: false,
  conversationId: null,
  setConnectionState: (connectionState) => set({ connectionState }),
  addTranscriptEntry: (entry) =>
    set((state) => ({ transcript: [...state.transcript, entry] })),
  updateLastEntry: (content) =>
    set((state) => {
      const entries = [...state.transcript];
      if (entries.length > 0) {
        entries[entries.length - 1] = { ...entries[entries.length - 1], content };
      }
      return { transcript: entries };
    }),
  clearTranscript: () => set({ transcript: [] }),
  setMuted: (isMuted) => set({ isMuted }),
  setConversationId: (conversationId) => set({ conversationId }),
  reset: () =>
    set({
      connectionState: { status: 'idle' },
      transcript: [],
      isMuted: false,
      conversationId: null,
    }),
}));
