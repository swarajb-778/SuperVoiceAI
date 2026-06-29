import { cn, getStatusColor } from '@/lib/utils';

interface BadgeProps { status: string; label?: string; className?: string; }

export function StatusBadge({ status, label, className }: BadgeProps) {
  return (
    <span className={cn('badge', getStatusColor(status), className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 flex-shrink-0" />
      {label || status.replace(/_/g, ' ')}
    </span>
  );
}

interface SimpleBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray' | 'orange';
  dot?: boolean;
  className?: string;
}

export function Badge({ children, variant = 'default', dot, className }: SimpleBadgeProps) {
  const styles: Record<string, React.CSSProperties> = {
    default: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',   color: '#94a3b8' },
    blue:    { background: 'rgba(59,130,246,0.1)',   border: '1px solid rgba(59,130,246,0.2)',    color: '#93c5fd' },
    green:   { background: 'rgba(34,197,94,0.1)',    border: '1px solid rgba(34,197,94,0.22)',    color: '#4ade80' },
    yellow:  { background: 'rgba(234,179,8,0.1)',    border: '1px solid rgba(234,179,8,0.2)',     color: '#fde047' },
    red:     { background: 'rgba(239,68,68,0.1)',    border: '1px solid rgba(239,68,68,0.2)',     color: '#fca5a5' },
    purple:  { background: 'rgba(139,92,246,0.1)',   border: '1px solid rgba(139,92,246,0.2)',    color: '#c4b5fd' },
    gray:    { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',  color: '#64748b' },
    orange:  { background: 'rgba(249,115,22,0.1)',   border: '1px solid rgba(249,115,22,0.2)',    color: '#fdba74' },
  };

  const dotColors: Record<string, string> = {
    default: '#64748b', blue: '#60a5fa', green: '#22c55e',
    yellow: '#eab308', red: '#ef4444', purple: '#8b5cf6',
    gray: '#475569', orange: '#f97316',
  };

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md', className)}
      style={styles[variant]}>
      {dot && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dotColors[variant] }} />}
      {children}
    </span>
  );
}
