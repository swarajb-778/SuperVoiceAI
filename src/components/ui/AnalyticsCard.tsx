import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string; };
  className?: string;
  accent?: 'blue' | 'green' | 'purple' | 'orange' | 'teal';
}

export function AnalyticsCard({ title, value, icon, trend, className, accent = 'green' }: AnalyticsCardProps) {
  const accents: Record<string, { iconBg: string; iconBorder: string; iconColor: string; barColor: string; trendBg: string; trendColor: string }> = {
    green:  { iconBg: 'rgba(34,197,94,0.1)',    iconBorder: 'rgba(34,197,94,0.2)',    iconColor: '#4ade80', barColor: '#22c55e',  trendBg: 'rgba(34,197,94,0.12)',   trendColor: '#4ade80' },
    teal:   { iconBg: 'rgba(20,184,166,0.1)',   iconBorder: 'rgba(20,184,166,0.2)',   iconColor: '#2dd4bf', barColor: '#14b8a6',  trendBg: 'rgba(20,184,166,0.12)',  trendColor: '#2dd4bf' },
    blue:   { iconBg: 'rgba(59,130,246,0.1)',   iconBorder: 'rgba(59,130,246,0.2)',   iconColor: '#60a5fa', barColor: '#3b82f6',  trendBg: 'rgba(59,130,246,0.12)',  trendColor: '#60a5fa' },
    purple: { iconBg: 'rgba(139,92,246,0.1)',   iconBorder: 'rgba(139,92,246,0.2)',   iconColor: '#a78bfa', barColor: '#8b5cf6',  trendBg: 'rgba(139,92,246,0.12)',  trendColor: '#a78bfa' },
    orange: { iconBg: 'rgba(249,115,22,0.1)',   iconBorder: 'rgba(249,115,22,0.2)',   iconColor: '#fb923c', barColor: '#f97316',  trendBg: 'rgba(249,115,22,0.12)',  trendColor: '#fb923c' },
  };

  const a = accents[accent];
  const TrendIcon = trend ? (trend.value > 0 ? TrendingUp : trend.value < 0 ? TrendingDown : Minus) : null;
  const trendPositive = trend ? trend.value > 0 : false;
  const trendNeutral  = trend ? trend.value === 0 : false;

  return (
    <div className={cn('card-surface p-4 relative overflow-hidden group', className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: a.iconBg, border: `1px solid ${a.iconBorder}`, color: a.iconColor }}>
          <span className="w-4 h-4">{icon}</span>
        </div>
        {trend && TrendIcon && (
          <div className="flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-md"
            style={trendPositive
              ? { background: 'rgba(34,197,94,0.12)', color: '#4ade80' }
              : trendNeutral
              ? { background: 'rgba(255,255,255,0.06)', color: '#64748b' }
              : { background: 'rgba(239,68,68,0.12)', color: '#f87171' }
            }>
            <TrendIcon className="w-3 h-3" />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div className="text-[22px] font-bold tabular-nums leading-none mb-1" style={{ color: '#f1f5f9' }}>{value}</div>
      <div className="text-[12px] font-medium" style={{ color: '#64748b' }}>{title}</div>
      {trend && <div className="text-[10px] mt-0.5" style={{ color: '#3d5060' }}>{trend.label}</div>}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500 rounded-b"
        style={{ background: a.barColor }} />
    </div>
  );
}
