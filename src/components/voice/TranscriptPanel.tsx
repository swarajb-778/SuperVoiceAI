'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, MessageSquare, User } from 'lucide-react';
import type { TranscriptEntry } from '@/types';
import { cn } from '@/lib/utils';

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
  className?: string;
  primaryColor?: string;
}

export function TranscriptPanel({ entries, className, primaryColor = '#22c55e' }: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center h-full gap-2', className)}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <MessageSquare className="w-4 h-4" style={{ color: '#2a3f4d' }} />
        </div>
        <p className="text-[11px]" style={{ color: '#2a3f4d' }}>Conversation will appear here</p>
      </div>
    );
  }

  return (
    <div className={cn('overflow-y-auto space-y-2.5 p-3', className)}>
      <AnimatePresence initial={false}>
        {entries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className={cn('flex gap-2', entry.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
          >
            {/* Avatar */}
            <div
              className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
              style={entry.role === 'assistant'
                ? { background: `${primaryColor}22`, border: `1px solid ${primaryColor}44`, color: primaryColor }
                : { background: 'rgba(255,255,255,0.07)', color: '#64748b' }
              }
            >
              {entry.role === 'assistant'
                ? <Bot className="w-2.5 h-2.5" />
                : <User className="w-2.5 h-2.5" />
              }
            </div>

            {/* Bubble */}
            <div
              className="max-w-[82%] px-2.5 py-2 rounded-xl text-[11px] leading-relaxed"
              style={entry.role === 'assistant'
                ? { background: `${primaryColor}12`, border: `1px solid ${primaryColor}25`, color: '#cbd5e1', borderTopLeftRadius: 4 }
                : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderTopRightRadius: 4 }
              }
            >
              {entry.content}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
}
