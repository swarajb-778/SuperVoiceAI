'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Modal({ isOpen, onClose, title, description, children, size = 'md', className }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 backdrop-blur-[3px]"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={cn('relative w-full rounded-xl z-10 overflow-hidden', sizes[size], className)}
            style={{ background: '#0d1518', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
          >
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg,#22c55e,#16a34a,#22c55e)' }} />

            {(title || description) && (
              <div className="flex items-start justify-between px-5 pt-5 pb-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div>
                  {title && <h2 className="text-[14px] font-bold tracking-tight" style={{ color: '#e2e8f0' }}>{title}</h2>}
                  {description && <p className="text-[12px] mt-0.5" style={{ color: '#4b6070' }}>{description}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="ml-4 p-1 rounded-md transition-colors"
                  style={{ color: '#4b6070' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = '#4b6070'; }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {!(title || description) && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-md transition-colors z-10"
                style={{ color: '#4b6070' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = '#4b6070'; }}
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="px-5 py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
