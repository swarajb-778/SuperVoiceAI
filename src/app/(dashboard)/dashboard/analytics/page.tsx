'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, MessageSquare, Calendar, Clock } from 'lucide-react';
import { useBusinessStore } from '@/store/business';
import { getDashboardAnalytics, getConversationTrend } from '@/services/conversations';
import { Card, CardHeader } from '@/components/ui/Card';
import { AnalyticsCard } from '@/components/ui/AnalyticsCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { formatDuration } from '@/lib/utils';
import type { DashboardAnalytics } from '@/types';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#22c55e', '#8b5cf6', '#f97316', '#3b82f6'];

export default function AnalyticsPage() {
  const { business } = useBusinessStore();
  const toast = useToast();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [trend30, setTrend30] = useState<Array<{ date: string; conversations: number; appointments: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!business) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      getDashboardAnalytics(business.id),
      getConversationTrend(business.id, 30),
    ]).then(([a, t]) => {
      setAnalytics(a);
      setTrend30(t);
    }).catch(() => {
      toast.error('Failed to load analytics');
    }).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business]);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const chartData = trend30.map((item) => ({
    ...item,
    date: new Date(item.date + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const todayUTC = new Date().toISOString().substring(0, 10);
  const [ty, tm, td] = todayUTC.split('-').map(Number);
  const todayJsDay = new Date(Date.UTC(ty, tm - 1, td)).getUTCDay();
  const daysFromMonday = todayJsDay === 0 ? 6 : todayJsDay - 1;
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(Date.UTC(ty, tm - 1, td - daysFromMonday + i));
    return dt.toISOString().substring(0, 10);
  });
  const trend30Map = Object.fromEntries(trend30.map((t) => [t.date, t]));
  const weekData = weekDays.map((dateStr) => {
    const entry = trend30Map[dateStr];
    return {
      date: new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'short' }),
      conversations: entry?.conversations ?? 0,
      appointments: entry?.appointments ?? 0,
    };
  });

  const maxWeekVal = Math.max(...weekData.map((d) => Math.max(d.conversations, d.appointments)), 1);

  const pieDataRaw = [
    { name: 'Appointments Booked', value: analytics?.appointments_booked || 0 },
    { name: 'Callback Requests', value: analytics?.callback_requests || 0 },
    { name: 'No Action', value: Math.max(0, (analytics?.total_conversations || 0) - (analytics?.appointments_booked || 0) - (analytics?.callback_requests || 0)) },
  ];
  const pieData = pieDataRaw.some((d) => d.value > 0)
    ? pieDataRaw.filter((d) => d.value > 0)
    : [{ name: 'No Data', value: 1 }];

  const tooltipStyle = {
    background: '#111c1f',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    fontSize: '12px',
    color: '#e2e8f0',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Conversations', value: analytics?.total_conversations ?? 0, icon: <MessageSquare className="w-4 h-4" />, accent: 'blue' as const },
          { title: 'Appointments Booked', value: analytics?.appointments_booked ?? 0, icon: <Calendar className="w-4 h-4" />, accent: 'green' as const },
          { title: 'Conversion Rate', value: `${analytics?.conversion_rate ?? 0}%`, icon: <TrendingUp className="w-4 h-4" />, accent: 'purple' as const },
          { title: 'Avg. Call Duration', value: formatDuration(analytics?.avg_call_duration ?? 0), icon: <Clock className="w-4 h-4" />, accent: 'orange' as const },
        ].map((card) => (
          <AnalyticsCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="30-Day Conversation Trend" />
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="analyticsConv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="analyticsAppt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#3d5060' }} tickLine={false} axisLine={false} interval={4} />
                  <YAxis tick={{ fontSize: 10, fill: '#3d5060' }} tickLine={false} axisLine={false} allowDecimals={false} domain={[0, 'auto']} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="conversations" stroke="#22c55e" strokeWidth={2} fill="url(#analyticsConv)" name="Conversations" dot={false} />
                  <Area type="monotone" dataKey="appointments" stroke="#8b5cf6" strokeWidth={2} fill="url(#analyticsAppt)" name="Appointments" strokeDasharray="4 2" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader title="Outcome Distribution" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={pieData.length > 1 ? 3 : 0} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'No Data' ? 'rgba(255,255,255,0.08)' : COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => name === 'No Data' ? ['—', 'No data yet'] : [value, name]} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="This Week - Daily Breakdown" />
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#3d5060' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#3d5060' }} tickLine={false} axisLine={false} allowDecimals={false} domain={[0, Math.max(maxWeekVal + 1, 5)]} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
              <Bar dataKey="conversations" name="Conversations" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="appointments" name="Appointments" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Today', conversations: analytics?.conversations_today ?? 0, appointments: analytics?.appointments_today ?? 0 },
          { label: 'This Week', conversations: analytics?.conversations_this_week ?? 0, appointments: analytics?.appointments_this_week ?? 0 },
          { label: 'This Month', conversations: analytics?.conversations_this_month ?? 0, appointments: 0 },
          { label: 'Callback Requests', conversations: analytics?.callback_requests ?? 0, appointments: 0 },
        ].map((item) => (
          <Card key={item.label} padding="sm">
            <div className="text-[11px] font-medium mb-2" style={{ color: '#4b6070' }}>{item.label}</div>
            <div className="text-[22px] font-bold tabular-nums" style={{ color: '#f1f5f9' }}>{item.conversations}</div>
            {item.appointments > 0 && (
              <div className="text-[11px] mt-0.5" style={{ color: '#4ade80' }}>{item.appointments} booked</div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
