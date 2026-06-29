'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Tab { id: string; label: string; count?: number; icon?: React.ReactNode; }

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
  variant?: 'underline' | 'pill';
}

export function Tabs({ tabs, activeTab, onTabChange, className, variant = 'underline' }: TabsProps) {
  if (variant === 'pill') {
    return (
      <div className={cn('inline-flex rounded-lg p-0.5', className)}
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn('relative flex items-center justify-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-md transition-all duration-150 whitespace-nowrap')}
              style={{ color: active ? '#e2e8f0' : '#4b6070' }}
            >
              {active && (
                <motion.div
                  layoutId="pill-bg"
                  className="absolute inset-0 rounded-md"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              {tab.icon && <span className="relative z-10 w-3.5 h-3.5">{tab.icon}</span>}
              <span className="relative z-10">{tab.label}</span>
              {tab.count !== undefined && (
                <span className="relative z-10 px-1.5 py-0.5 text-[10px] font-bold rounded-md leading-none"
                  style={active
                    ? { background: 'rgba(34,197,94,0.15)', color: '#4ade80' }
                    : { background: 'rgba(255,255,255,0.06)', color: '#4b6070' }
                  }>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex gap-0', className)} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium transition-all duration-150 whitespace-nowrap"
            style={{ color: active ? '#4ade80' : '#4b6070' }}
          >
            {tab.icon && <span className="w-3.5 h-3.5">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-md leading-none"
                style={active
                  ? { background: 'rgba(34,197,94,0.15)', color: '#4ade80' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#4b6070' }
                }>
                {tab.count}
              </span>
            )}
            {active && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ background: '#22c55e' }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
