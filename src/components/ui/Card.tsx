import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export function Card({ className, children, padding = 'md', glow }: CardProps) {
  const paddings = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };
  return (
    <div className={cn(glow ? 'card-glow' : 'card-surface', paddings[padding], className)}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function CardHeader({ title, description, action, className, icon }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <div className="flex items-center gap-2.5">
        {icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-[13px] font-bold tracking-tight" style={{ color: '#e2e8f0' }}>{title}</h3>
          {description && <p className="text-[11px] mt-0.5" style={{ color: '#3d5060' }}>{description}</p>}
        </div>
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
}
