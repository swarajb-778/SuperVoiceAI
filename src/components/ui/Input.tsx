import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, style, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#a8a29e' }}>
            {label}
            {props.required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#78716c' }}>
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-3 py-2 text-[13px] rounded-lg transition-all duration-150 outline-none',
              leftIcon && 'pl-9',
              className
            )}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: error ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)',
              color: '#e7e5e4',
              ...style,
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = error ? 'rgba(239,68,68,0.7)' : 'rgba(245,158,11,0.4)';
              e.currentTarget.style.boxShadow = error ? '0 0 0 3px rgba(239,68,68,0.1)' : '0 0 0 3px rgba(245,158,11,0.08)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)';
              e.currentTarget.style.boxShadow = '';
            }}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] mt-1" style={{ color: '#f87171' }}>{error}</p>}
        {hint && !error && <p className="text-[11px] mt-1" style={{ color: '#78716c' }}>{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
