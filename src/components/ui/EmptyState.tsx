import { cn } from '@/lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void; };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-14 px-4 text-center', className)}>
      {icon && (
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', color: '#4ade80' }}>
          {icon}
        </div>
      )}
      <h3 className="text-[13px] font-bold mb-1 tracking-tight" style={{ color: '#e2e8f0' }}>{title}</h3>
      {description && (
        <p className="text-[12px] max-w-xs leading-relaxed" style={{ color: '#4b6070' }}>{description}</p>
      )}
      {action && (
        <div className="mt-4">
          <Button size="sm" onClick={action.onClick}>{action.label}</Button>
        </div>
      )}
    </div>
  );
}
