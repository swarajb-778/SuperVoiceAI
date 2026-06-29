import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectOption { value: string; label: string; }

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, style, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#94a3b8' }}>
            {label}
            {props.required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn('w-full px-3 py-2 text-[13px] rounded-lg appearance-none pr-9 cursor-pointer outline-none transition-all duration-150', className)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: error ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)',
              color: '#e2e8f0',
              ...style,
            }}
            {...props}
          >
            {placeholder && <option value="" disabled style={{ background: '#0d1518' }}>{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} style={{ background: '#0d1518', color: '#e2e8f0' }}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#4b6070' }} />
        </div>
        {error && <p className="text-[11px] mt-1" style={{ color: '#f87171' }}>{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export { Select };
