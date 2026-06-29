'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Phone, Sparkles } from 'lucide-react';
import { useRealtimeVoice } from '@/hooks/useRealtimeVoice';
import { useVoiceStore } from '@/store/voice';
import { VoiceOrb } from './VoiceOrb';
import { Waveform } from './Waveform';
import { TranscriptPanel } from './TranscriptPanel';
import { cn } from '@/lib/utils';

interface VoiceWidgetProps {
  businessId: string;
  businessName?: string;
  primaryColor?: string;
  position?: 'bottom-right' | 'bottom-left';
  greeting?: string;
}

export function VoiceWidget({
  businessId,
  businessName = 'Auto Repair',
  primaryColor = '#22c55e',
  position = 'bottom-right',
  greeting,
}: VoiceWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { transcript, connectionState } = useVoiceStore();

  const { connect, disconnect, toggleMute, isMuted } = useRealtimeVoice({
    businessId,
    onConversationEnd: () => {},
  });

  const handleClose = async () => {
    if (connectionState.status !== 'idle') {
      await disconnect();
    }
    setIsOpen(false);
  };

  const isSpeaking = connectionState.status === 'speaking';
  const isListening = connectionState.status === 'listening';
  const isActive = isSpeaking || isListening;
  const isConnected = ['connected', 'listening', 'speaking'].includes(connectionState.status);

  const positionClass = position === 'bottom-right' ? 'right-5' : 'left-5';

  return (
    <div className={cn('fixed bottom-5 z-50', positionClass)}>
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="w-[340px] rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(8,14,16,0.97)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <div className="relative px-4 py-3.5 flex items-center justify-between overflow-hidden"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {/* Subtle gradient bg */}
              <div className="absolute inset-0 opacity-20"
                style={{ background: `linear-gradient(135deg, ${primaryColor}33 0%, transparent 60%)` }} />

              <div className="relative flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${primaryColor}22`, border: `1px solid ${primaryColor}44` }}>
                  <Mic className="w-4 h-4" style={{ color: primaryColor }} />
                </div>
                <div>
                  <div className="text-[13px] font-bold leading-tight" style={{ color: '#f1f5f9' }}>
                    {businessName}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: primaryColor }} />
                    <span className="text-[10px] font-medium" style={{ color: primaryColor }}>
                      {isConnected ? (isSpeaking ? 'Speaking…' : 'Listening…') : 'AI Receptionist'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center gap-2">
                {isActive && (
                  <Waveform isActive={isSpeaking} barCount={5} color={primaryColor} />
                )}
                <button
                  onClick={handleClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#64748b' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = '#e2e8f0'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#64748b'; }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Transcript */}
            <div className="h-48" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <TranscriptPanel entries={transcript} className="h-full" primaryColor={primaryColor} />
            </div>

            {/* Voice Control Area */}
            <div className="px-5 py-5 flex flex-col items-center gap-4">
              {connectionState.status === 'idle' && (
                <p className="text-[12px] text-center leading-relaxed" style={{ color: '#4b6070' }}>
                  {greeting || `Talk to our AI receptionist — ask about services, hours, or book an appointment`}
                </p>
              )}

              <VoiceOrb
                connectionState={connectionState}
                isMuted={isMuted}
                onConnect={connect}
                onDisconnect={disconnect}
                onToggleMute={toggleMute}
                size="sm"
                primaryColor={primaryColor}
              />
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 flex items-center justify-center gap-1.5"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.3)' }}>
              <Sparkles className="w-3 h-3" style={{ color: '#3d5060' }} />
              <span className="text-[10px]" style={{ color: '#2a3f4d' }}>Powered by CarBot AI</span>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="fab"
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={() => setIsOpen(true)}
            className="relative flex items-center justify-center"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
          >
            {/* Outer pulse ring */}
            <motion.div
              className="absolute w-16 h-16 rounded-full"
              style={{ background: primaryColor, opacity: 0.25 }}
              animate={{ scale: [1, 1.5], opacity: [0.25, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
            />
            {/* Secondary ring */}
            <motion.div
              className="absolute w-16 h-16 rounded-full"
              style={{ background: primaryColor, opacity: 0.15 }}
              animate={{ scale: [1, 1.8], opacity: [0.15, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
            />
            {/* Button */}
            <div
              className="relative w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
                boxShadow: `0 8px 24px ${primaryColor}55, 0 2px 8px rgba(0,0,0,0.4)`,
              }}
            >
              <Phone className="w-6 h-6 text-white" />
            </div>

            {/* Tooltip */}
            <div
              className="absolute bottom-full mb-3 right-0 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap pointer-events-none"
              style={{ background: 'rgba(8,14,16,0.95)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}
            >
              Talk to AI
              <div className="absolute top-full right-4 w-0 h-0" style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid rgba(255,255,255,0.1)' }} />
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
