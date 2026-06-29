'use client';

import { motion } from 'framer-motion';
import { Mic, MicOff, PhoneOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VoiceConnectionState } from '@/types';

interface VoiceOrbProps {
  connectionState: VoiceConnectionState;
  isMuted: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onToggleMute: () => void;
  size?: 'sm' | 'md' | 'lg';
  primaryColor?: string;
}

export function VoiceOrb({
  connectionState,
  isMuted,
  onConnect,
  onDisconnect,
  onToggleMute,
  size = 'md',
  primaryColor = '#22c55e',
}: VoiceOrbProps) {
  const isConnected = ['connected', 'listening', 'speaking'].includes(connectionState.status);
  const isSpeaking = connectionState.status === 'speaking';
  const isListening = connectionState.status === 'listening';
  const isConnecting = connectionState.status === 'connecting';

  const sizes = {
    sm: { orb: 56, icon: 'w-5 h-5' },
    md: { orb: 80, icon: 'w-7 h-7' },
    lg: { orb: 112, icon: 'w-10 h-10' },
  };
  const s = sizes[size];

  const handleMainClick = () => {
    if (isConnected) onToggleMute();
    else onConnect();
  };

  const orbBg = isConnecting
    ? 'rgba(255,255,255,0.06)'
    : isMuted && isConnected
    ? 'rgba(255,255,255,0.08)'
    : `linear-gradient(135deg, ${primaryColor}, ${primaryColor}bb)`;

  const orbShadow = isConnecting || (isMuted && isConnected)
    ? 'none'
    : `0 0 ${isSpeaking ? 32 : 20}px ${primaryColor}55, 0 4px 16px rgba(0,0,0,0.4)`;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="relative flex items-center justify-center">
        {/* Outer speaking rings */}
        {isSpeaking && (
          <>
            <motion.div
              className="absolute rounded-full"
              style={{ width: s.orb * 1.7, height: s.orb * 1.7, background: `${primaryColor}12` }}
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute rounded-full"
              style={{ width: s.orb * 2.1, height: s.orb * 2.1, background: `${primaryColor}07` }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: 0.25 }}
            />
          </>
        )}

        {/* Listening ring */}
        {isListening && (
          <motion.div
            className="absolute rounded-full"
            style={{ width: s.orb * 1.5, height: s.orb * 1.5, border: `1.5px solid ${primaryColor}44` }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Main orb */}
        <motion.button
          onClick={handleMainClick}
          whileTap={{ scale: 0.93 }}
          disabled={isConnecting}
          className="relative rounded-full flex items-center justify-center z-10 transition-all duration-300"
          style={{
            width: s.orb,
            height: s.orb,
            background: orbBg,
            boxShadow: orbShadow,
            border: isMuted && isConnected ? '1.5px solid rgba(255,255,255,0.12)' : 'none',
            cursor: isConnecting ? 'not-allowed' : 'pointer',
          }}
        >
          {/* Shimmer on speaking */}
          {isSpeaking && !isMuted && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: 'rgba(255,255,255,0.12)' }}
              animate={{ opacity: [0, 0.4, 0] }}
              transition={{ duration: 0.9, repeat: Infinity }}
            />
          )}

          {isConnecting ? (
            <Loader2 className={cn(s.icon, 'animate-spin')} style={{ color: primaryColor }} />
          ) : isConnected ? (
            isMuted ? (
              <MicOff className={s.icon} style={{ color: '#64748b' }} />
            ) : (
              <Mic className={cn(s.icon, 'text-white')} />
            )
          ) : (
            <Mic className={cn(s.icon, 'text-white')} />
          )}
        </motion.button>
      </div>

      {/* Status + End Call */}
      {isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5"
        >
          <StatusLabel status={connectionState.status} isMuted={isMuted} primaryColor={primaryColor} />
          <button
            onClick={onDisconnect}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.18)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}
          >
            <PhoneOff className="w-3 h-3" />
            End
          </button>
        </motion.div>
      )}

      {!isConnected && connectionState.status === 'idle' && (
        <p className="text-[11px]" style={{ color: '#3d5060' }}>Tap to start</p>
      )}

      {connectionState.status === 'error' && (
        <p className="text-[11px] text-center max-w-[180px] leading-relaxed" style={{ color: '#f87171' }}>
          {connectionState.error}
        </p>
      )}
    </div>
  );
}

function StatusLabel({ status, isMuted, primaryColor }: { status: string; isMuted: boolean; primaryColor: string }) {
  if (isMuted) {
    return (
      <div className="flex items-center gap-1 text-[11px] font-medium" style={{ color: '#64748b' }}>
        <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
        Muted
      </div>
    );
  }

  const labels: Record<string, string> = {
    listening: 'Listening…',
    speaking: 'AI Speaking',
    connected: 'Connected',
  };

  const text = labels[status];
  if (!text) return null;

  return (
    <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: primaryColor }}>
      <motion.div
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: primaryColor }}
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.1, repeat: Infinity }}
      />
      {text}
    </div>
  );
}
