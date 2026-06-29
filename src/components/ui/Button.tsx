'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, children, disabled, style, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-1.5 font-semibold transition-all duration-150 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/30 active:scale-[0.98] select-none';

    const sizes = {
      sm: 'px-2.5 py-1.5 text-[12px]',
      md: 'px-3.5 py-2 text-[13px]',
      lg: 'px-4 py-2.5 text-[13px]',
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: { background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', boxShadow: '0 1px 2px rgba(22,163,74,0.4), inset 0 1px 0 rgba(255,255,255,0.12)' },
      danger:  { background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', boxShadow: '0 1px 2px rgba(239,68,68,0.35)' },
    };

    const variantClasses: Record<string, string> = {
      primary:   '',
      secondary: '',
      danger:    '',
      ghost:     'hover:bg-white/5',
      outline:   '',
    };

    const inlineStyle: React.CSSProperties = variant === 'secondary'
      ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', ...style }
      : variant === 'ghost'
      ? { color: '#4b6070', ...style }
      : variant === 'outline'
      ? { background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80', ...style }
      : { ...variantStyles[variant], ...style };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variantClasses[variant], sizes[size], className)}
        style={inlineStyle}
        {...props}
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
