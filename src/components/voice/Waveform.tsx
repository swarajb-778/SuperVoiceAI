'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WaveformProps {
  isActive: boolean;
  barCount?: number;
  className?: string;
  color?: string;
}

const BAR_HEIGHTS = [6, 10, 14, 10, 6];

export function Waveform({ isActive, barCount = 5, className, color = '#22c55e' }: WaveformProps) {
  const bars = Array.from({ length: barCount });

  if (!isActive) {
    return (
      <div className={cn('flex items-center gap-0.5', className)}>
        {bars.map((_, i) => (
          <div
            key={i}
            className="w-[3px] rounded-full"
            style={{ height: 3, background: color, opacity: 0.25 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {bars.map((_, i) => {
        const maxH = BAR_HEIGHTS[i % BAR_HEIGHTS.length];
        return (
          <motion.div
            key={i}
            className="w-[3px] rounded-full"
            style={{ background: color }}
            animate={{ height: [3, maxH, 3] }}
            transition={{
              duration: 0.55 + i * 0.08,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: i * 0.07,
            }}
          />
        );
      })}
    </div>
  );
}
