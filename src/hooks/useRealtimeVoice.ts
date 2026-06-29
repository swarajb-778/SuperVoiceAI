'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useVoiceStore } from '@/store/voice';
import type { TranscriptEntry } from '@/types';

interface UseRealtimeVoiceOptions {
  businessId: string;
  onConversationEnd?: (conversationId: string) => void;
}

export function useRealtimeVoice({ businessId, onConversationEnd }: UseRealtimeVoiceOptions) {
  const {
    setConnectionState,
    addTranscriptEntry,
    updateLastEntry,
    clearTranscript,
    setConversationId,
    setMuted,
    isMuted,
    connectionState,
    conversationId,
  } = useVoiceStore();

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const assistantMessageIdRef = useRef<string | null>(null);
  const pendingSavesRef = useRef<Promise<unknown>[]>([]);

  const connect = useCallback(async () => {
    if (connectionState.status !== 'idle' && connectionState.status !== 'error') return;

    setConnectionState({ status: 'connecting' });
    clearTranscript();

    try {
      /* Phase 1: fetch session config from our backend */
      const res = await fetch('/api/realtime/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      });

      if (!res.ok) throw new Error('Failed to create session');

      const sessionData = await res.json();
      const { conversationId: convId } = sessionData;
      const model = sessionData.model || 'gpt-4o-realtime';

      setConversationId(convId);
      startTimeRef.current = Date.now();

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      audioRef.current = audioEl;

      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0];
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const dc = pc.createDataChannel('oai-events');
      dcRef.current = dc;

      dc.onopen = () => {
        setConnectionState({ status: 'listening' });
        /* Trigger the greeting */
        dc.send(JSON.stringify({ type: 'response.create' }));
      };

      dc.onmessage = async (e) => {
        try {
          const event = JSON.parse(e.data);
await handleRealtimeEvent(event, convId, businessId);
        } catch (err) {
          console.error('Event parse error:', err);
        }
      };

      dc.onerror = (err) => {
        console.error('DataChannel error:', err);
        setConnectionState({ status: 'error', error: 'Connection error' });
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
          setConnectionState({ status: 'idle' });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      /* Wait for ICE gathering to complete before sending SDP */
      const completeSdp = await new Promise<string>((resolve) => {
        if (pc.iceGatheringState === 'complete') {
          resolve(pc.localDescription!.sdp);
        } else {
          pc.addEventListener('icegatheringstatechange', () => {
            if (pc.iceGatheringState === 'complete') {
              resolve(pc.localDescription!.sdp);
            }
          });
        }
      });

      /* Phase 2: proxy SDP + session config through our backend */
      const sdpRes = await fetch('/api/realtime/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sdp: completeSdp,
          model,
          voice: sessionData.voice,
          instructions: sessionData.systemPrompt,
          tools: sessionData.tools,
          turnDetection: sessionData.turnDetection,
        }),
      });

      if (!sdpRes.ok) throw new Error('SDP exchange failed');

      const answerSdp = await sdpRes.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });

    } catch (err) {
      console.error('Voice connection error:', err);
      setConnectionState({ status: 'error', error: 'Failed to connect. Check microphone permissions.' });
      cleanup();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, connectionState.status]);

  const handleRealtimeEvent = async (event: Record<string, unknown>, convId: string, bId: string) => {
    const type = event.type as string;

    // ── Speaking state ───────────────────────────────────────────────────────
    if (type === 'input_audio_buffer.speech_started') {
      setConnectionState({ status: 'listening' });
    }

    if (type === 'response.created') {
      setConnectionState({ status: 'speaking' });
    }

    // ── User spoke — GA doesn't transcribe user audio, show placeholder ───────
    if (type === 'input_audio_buffer.committed') {
      addTranscriptEntry({ id: `user-${Date.now()}`, role: 'user', content: '🎤 Voice message', timestamp: Date.now() });
    }

    // ── Assistant transcript (GA: response.output_audio_transcript.*) ─────────
    if (type === 'response.output_audio_transcript.delta') {
      const delta = (event.delta as string) || '';
      if (delta) {
        if (assistantMessageIdRef.current === null) {
          const id = `assistant-${Date.now()}`;
          assistantMessageIdRef.current = id;
          addTranscriptEntry({ id, role: 'assistant', content: delta, timestamp: Date.now() });
        } else {
          updateLastEntry((useVoiceStore.getState().transcript.at(-1)?.content || '') + delta);
        }
        setConnectionState({ status: 'speaking' });
      }
    }

    if (type === 'response.output_audio_transcript.done') {
      const transcript = (event.transcript as string) || '';
      if (transcript) {
        // replace streamed partial with the authoritative final text
        if (assistantMessageIdRef.current !== null) {
          updateLastEntry(transcript);
        } else {
          addTranscriptEntry({ id: `assistant-${Date.now()}`, role: 'assistant', content: transcript, timestamp: Date.now() });
        }
        if (convId) {
          const p = fetch('/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationId: convId, role: 'assistant', content: transcript }),
          }).catch(console.error);
          pendingSavesRef.current.push(p);
        }
      }
      assistantMessageIdRef.current = null;
      setConnectionState({ status: 'listening' });
    }

    // ── User transcript (whisper transcription enabled via session.update) ─────
    if (type === 'conversation.item.input_audio_transcription.completed') {
      const transcript = (event.transcript as string) || '';
      if (transcript.trim()) {
        addTranscriptEntry({ id: `user-${Date.now()}`, role: 'user', content: transcript, timestamp: Date.now() });
        if (convId) {
          const p = fetch('/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationId: convId, role: 'user', content: transcript }),
          }).catch(console.error);
          pendingSavesRef.current.push(p);
        }
      }
    }

    if (type === 'response.function_call_arguments.done') {
      const toolName = (event.name as string) || '';
      const toolArgs = JSON.parse((event.arguments as string) || '{}');

      try {
        const toolRes = await fetch('/api/realtime/tools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toolName, toolArgs, businessId: bId, conversationId: convId }),
        });
        const { result } = await toolRes.json();

        if (dcRef.current?.readyState === 'open') {
          dcRef.current.send(JSON.stringify({
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: event.call_id,
              output: JSON.stringify(result),
            },
          }));
          dcRef.current.send(JSON.stringify({ type: 'response.create' }));
        }
      } catch (err) {
        console.error('Tool call failed:', err);
      }
    }

    if (type === 'error') {
      const error = event.error as { message?: string };
      console.error('Realtime error:', error);
    }
  };

  const disconnect = useCallback(async () => {
    const convId = conversationId;
    const duration = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : null;

    cleanup();
    setConnectionState({ status: 'idle' });

    if (convId) {
      // Wait for all in-flight message saves so sentiment derivation has data
      await Promise.all(pendingSavesRef.current).catch(() => {});
      pendingSavesRef.current = [];

      await fetch('/api/conversations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: convId,
          updates: { status: 'completed', duration_seconds: duration },
        }),
      }).catch(console.error);

      onConversationEnd?.(convId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, onConversationEnd]);

  const cleanup = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    dcRef.current?.close();
    dcRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    if (audioRef.current) {
      audioRef.current.srcObject = null;
    }
    startTimeRef.current = null;
  };

  const toggleMute = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = isMuted;
    });
    setMuted(!isMuted);
  }, [isMuted, setMuted]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return {
    connect,
    disconnect,
    toggleMute,
    connectionState,
    isMuted,
    conversationId,
  };
}
