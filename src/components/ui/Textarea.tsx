import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, style, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#94a3b8' }}>
            {label}
            {props.required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn('w-full px-3 py-2 text-[13px] rounded-lg resize-none outline-none transition-all duration-150', className)}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: error ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)',
            color: '#e2e8f0',
            ...style,
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = error ? 'rgba(239,68,68,0.7)' : 'rgba(34,197,94,0.4)';
            e.currentTarget.style.boxShadow = error ? '0 0 0 3px rgba(239,68,68,0.1)' : '0 0 0 3px rgba(34,197,94,0.08)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)';
            e.currentTarget.style.boxShadow = '';
          }}
          {...props}
        />
        {error && <p className="text-[11px] mt-1" style={{ color: '#f87171' }}>{error}</p>}
        {hint && !error && <p className="text-[11px] mt-1" style={{ color: '#4b6070' }}>{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export { Textarea };
