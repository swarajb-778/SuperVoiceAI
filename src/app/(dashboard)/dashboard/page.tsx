'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Calendar, TrendingUp, Clock, PhoneCall,
  Bot, ArrowRight, RefreshCw,
} from 'lucide-react';
import { useBusinessStore } from '@/store/business';
import { getDashboardAnalytics, getConversationTrend } from '@/services/conversations';
import { getAppointments } from '@/services/appointments';
import { getAgents } from '@/services/agents';
import { AnalyticsCard } from '@/components/ui/AnalyticsCard';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime, formatDuration } from '@/lib/utils';
import type { DashboardAnalytics, Appointment, Agent } from '@/types';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import Link from 'next/link';

export default function DashboardPage() {
  const { business, isLoading: businessLoading } = useBusinessStore();
  const toast = useToast();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [trend, setTrend] = useState<Array<{ date: string; conversations: number; appointments: number }>>([]);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!business) return;
    setLoading(true);
    try {
      const [analyticsData, trendData, apptData, agentData] = await Promise.all([
        getDashboardAnalytics(business.id),
        getConversationTrend(business.id, 14),
        getAppointments(business.id, { limit: 5 }),
        getAgents(business.id),
      ]);
      setAnalytics(analyticsData);
      setTrend(trendData);
      setRecentAppointments(apptData.data);
      setAgents(agentData);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (business) loadData();
    else if (!businessLoading) setLoading(false);
  }, [business, businessLoading]);

  if (businessLoading || (loading && !analytics)) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
          <Bot className="w-6 h-6" />
        </div>
        <h2 className="text-[16px] font-semibold mb-2" style={{ color: '#e2e8f0' }}>Set up your business</h2>
        <p className="text-[13px] mb-4 text-center max-w-xs" style={{ color: '#4b6070' }}>
          Complete your business profile to start using AI voice receptionist
        </p>
        <Link href="/dashboard/settings">
          <Button>Go to Settings</Button>
        </Link>
      </div>
    );
  }

  const chartData = trend.map((item) => ({
    ...item,
    date: new Date(item.date + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-semibold" style={{ color: '#e2e8f0' }}>Good morning</h2>
          <p className="text-[13px]" style={{ color: '#4b6070' }}>{business.name}</p>
        </div>
        <Button variant="ghost" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={loadData}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Conversations', value: analytics?.total_conversations ?? 0, icon: <MessageSquare className="w-4 h-4" />, accent: 'blue' as const },
          { title: 'Appointments Booked', value: analytics?.appointments_booked ?? 0, icon: <Calendar className="w-4 h-4" />, accent: 'green' as const },
          { title: 'Conversion Rate', value: `${analytics?.conversion_rate ?? 0}%`, icon: <TrendingUp className="w-4 h-4" />, accent: 'purple' as const },
          { title: 'Avg. Call Duration', value: formatDuration(analytics?.avg_call_duration ?? 0), icon: <Clock className="w-4 h-4" />, accent: 'orange' as const },
        ].map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
            <AnalyticsCard {...card} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Conversation Trend" description="Last 14 days" />
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAppt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#3d5060' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: '#3d5060' }} tickLine={false} axisLine={false} allowDecimals={false} domain={[0, 'auto']} width={24} />
                  <Tooltip
                    contentStyle={{
                      background: '#111c1f',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      fontSize: '12px',
                      color: '#e2e8f0',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    }}
                  />
                  <Area type="monotone" dataKey="conversations" stroke="#22c55e" strokeWidth={2} fill="url(#colorConv)" name="Conversations" />
                  <Area type="monotone" dataKey="appointments" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorAppt)" name="Appointments" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="space-y-1">
              {[
                { label: "Today's Conversations", value: analytics?.conversations_today ?? 0, icon: <MessageSquare className="w-3.5 h-3.5" />, color: '#60a5fa' },
                { label: "This Week", value: analytics?.conversations_this_week ?? 0, icon: <MessageSquare className="w-3.5 h-3.5" />, color: '#a78bfa' },
                { label: "Callbacks Requested", value: analytics?.callback_requests ?? 0, icon: <PhoneCall className="w-3.5 h-3.5" />, color: '#fb923c' },
                { label: "Active Agents", value: agents.filter((a) => a.is_active).length, icon: <Bot className="w-3.5 h-3.5" />, color: '#4ade80' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.05)', color: item.color }}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px]" style={{ color: '#4b6070' }}>{item.label}</div>
                    <div className="text-[14px] font-semibold" style={{ color: '#e2e8f0' }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Recent Appointments"
          action={
            <Link href="/dashboard/appointments">
              <Button variant="ghost" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>View All</Button>
            </Link>
          }
        />
        {recentAppointments.length === 0 ? (
          <div className="text-center py-8 text-[13px]" style={{ color: '#3d5060' }}>
            No appointments yet. Appointments booked via AI will appear here.
          </div>
        ) : (
          <div>
            {recentAppointments.map((appt, i) => (
              <div key={appt.id} className="flex items-center gap-4 py-3"
                style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : undefined }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
                  style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80' }}>
                  {appt.customer_name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate" style={{ color: '#e2e8f0' }}>{appt.customer_name}</div>
                  <div className="text-[11px] truncate" style={{ color: '#3d5060' }}>
                    {appt.vehicle_year} {appt.vehicle_make} {appt.vehicle_model}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[11px]" style={{ color: '#4b6070' }}>{formatDateTime(appt.scheduled_at)}</div>
                  <div className="mt-0.5"><StatusBadge status={appt.status} /></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
