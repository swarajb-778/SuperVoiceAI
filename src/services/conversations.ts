import { createClient } from '@/lib/supabase/client';
import type { Conversation, ConversationMessage } from '@/types';

export async function getConversations(
  businessId: string,
  filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ data: Conversation[]; count: number }> {
  const supabase = createClient();

  let query = supabase
    .from('conversations')
    .select('*', { count: 'exact' })
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
  }

  const { data, error, count } = await query;

  if (error) throw error;
  return { data: data || [], count: count || 0 };
}

export async function getConversation(conversationId: string): Promise<Conversation | null> {
  const supabase = createClient();

  const { data } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  return data;
}

export async function getConversationMessages(
  conversationId: string
): Promise<ConversationMessage[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('conversation_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getDashboardAnalytics(businessId: string) {
  const supabase = createClient();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: totalConversations },
    { count: appointmentsBooked },
    { count: callbackRequests },
    { count: conversationsToday },
    { count: conversationsWeek },
    { count: conversationsMonth },
    { count: appointmentsToday },
    { count: appointmentsWeek },
    { data: durationData },
  ] = await Promise.all([
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('business_id', businessId),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('appointment_booked', true),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('callback_requested', true),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('business_id', businessId).gte('created_at', todayStart),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('business_id', businessId).gte('created_at', weekStart),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('business_id', businessId).gte('created_at', monthStart),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('business_id', businessId).gte('created_at', todayStart),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('business_id', businessId).gte('created_at', weekStart),
    supabase.from('conversations').select('duration_seconds').eq('business_id', businessId).not('duration_seconds', 'is', null),
  ]);

  const durations = (durationData || []).map((c) => c.duration_seconds as number).filter(Boolean);
  const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  const conversionRate = totalConversations && totalConversations > 0
    ? Math.round(((appointmentsBooked || 0) / totalConversations) * 100 * 10) / 10
    : 0;

  return {
    total_conversations: totalConversations || 0,
    appointments_booked: appointmentsBooked || 0,
    conversion_rate: conversionRate,
    avg_call_duration: avgDuration,
    callback_requests: callbackRequests || 0,
    conversations_today: conversationsToday || 0,
    conversations_this_week: conversationsWeek || 0,
    conversations_this_month: conversationsMonth || 0,
    appointments_today: appointmentsToday || 0,
    appointments_this_week: appointmentsWeek || 0,
  };
}

// Returns YYYY-MM-DD for a UTC timestamp string, consistently
function utcDateKey(isoString: string): string {
  return isoString.substring(0, 10);
}

// Returns YYYY-MM-DD for today in UTC
function utcToday(): string {
  return new Date().toISOString().substring(0, 10);
}

// Add N days to a YYYY-MM-DD string without timezone shifts
function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().substring(0, 10);
}

export async function getConversationTrend(
  businessId: string,
  days: number = 30
): Promise<Array<{ date: string; conversations: number; appointments: number }>> {
  const supabase = createClient();

  // Build start date entirely in UTC to match Supabase's UTC timestamps
  const todayKey = utcToday();
  const startKey = addDays(todayKey, -(days - 1));

  const { data } = await supabase
    .from('conversations')
    .select('created_at, appointment_booked')
    .eq('business_id', businessId)
    .gte('created_at', startKey + 'T00:00:00.000Z')
    .order('created_at');

  // Pre-fill every day in range with zeros
  const grouped: Record<string, { conversations: number; appointments: number }> = {};
  for (let i = 0; i < days; i++) {
    grouped[addDays(startKey, i)] = { conversations: 0, appointments: 0 };
  }

  (data || []).forEach((conv) => {
    const key = utcDateKey(conv.created_at);
    if (grouped[key]) {
      grouped[key].conversations++;
      if (conv.appointment_booked) grouped[key].appointments++;
    }
  });

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, ...vals }));
}
