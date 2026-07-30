import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { bookedSlotSet, buildSlotGrid, dayOfWeekForDate } from '@/services/slots';
import type { Appointment } from '@/types';
import type { AppointmentFormData } from '@/validations';

export async function getAppointments(
  businessId: string,
  filters?: {
    status?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ data: Appointment[]; count: number }> {
  const supabase = createClient();

  let query = supabase
    .from('appointments')
    .select('*, service:services(id,name,price_type,price_min,price_max)', { count: 'exact' })
    .eq('business_id', businessId)
    .order('scheduled_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.from) {
    query = query.gte('scheduled_at', filters.from);
  }
  if (filters?.to) {
    query = query.lte('scheduled_at', filters.to);
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

export async function getAppointment(appointmentId: string): Promise<Appointment | null> {
  const supabase = createClient();

  const { data } = await supabase
    .from('appointments')
    .select('*, service:services(*)')
    .eq('id', appointmentId)
    .single();

  return data;
}

export async function createAppointment(
  businessId: string,
  formData: AppointmentFormData,
  conversationId?: string
): Promise<Appointment> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      business_id: businessId,
      service_id: formData.service_id || null,
      conversation_id: conversationId || null,
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone || null,
      customer_email: formData.customer_email || null,
      vehicle_year: formData.vehicle_year || null,
      vehicle_make: formData.vehicle_make || null,
      vehicle_model: formData.vehicle_model || null,
      scheduled_at: formData.scheduled_at,
      duration_minutes: formData.duration_minutes,
      notes: formData.notes || null,
      status: formData.status,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAppointment(
  appointmentId: string,
  data: Partial<AppointmentFormData>
): Promise<Appointment> {
  const supabase = createClient();

  const { data: appointment, error } = await supabase
    .from('appointments')
    .update({
      customer_name: data.customer_name,
      customer_phone: data.customer_phone || null,
      customer_email: data.customer_email || null,
      vehicle_year: data.vehicle_year || null,
      vehicle_make: data.vehicle_make || null,
      vehicle_model: data.vehicle_model || null,
      service_id: data.service_id || null,
      scheduled_at: data.scheduled_at,
      duration_minutes: data.duration_minutes,
      notes: data.notes || null,
      status: data.status,
    })
    .eq('id', appointmentId)
    .select()
    .single();

  if (error) throw error;
  return appointment;
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId);

  if (error) throw error;
}

export async function deleteAppointment(appointmentId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', appointmentId);

  if (error) throw error;
}

export async function getAvailableSlots(
  businessId: string,
  date: string,
  durationMinutes: number = 60,
  opts?: { client?: SupabaseClient; timeZone?: string }
): Promise<string[]> {
  // Callers without an authenticated session (the AI tool route) MUST inject a privileged
  // client: `appointments` has no anon SELECT policy, so the anon client returns zero rows
  // and every slot looks free — silently double-booking. The dashboard's own client is
  // correct here, since RLS grants owners their own rows.
  const supabase = opts?.client ?? createClient();
  const timeZone = opts?.timeZone || 'UTC';

  const { data: hours } = await supabase
    .from('business_hours')
    .select('*')
    .eq('business_id', businessId)
    .eq('day_of_week', dayOfWeekForDate(date))
    .eq('is_open', true)
    .single();

  if (!hours || !hours.open_time || !hours.close_time) return [];

  // Widen the window by a day on each side so the business-local day is fully covered
  // regardless of UTC offset, then filter precisely by zone-projected calendar date.
  const dayBefore = new Date(`${date}T00:00:00Z`);
  dayBefore.setUTCDate(dayBefore.getUTCDate() - 1);
  const dayAfter = new Date(`${date}T00:00:00Z`);
  dayAfter.setUTCDate(dayAfter.getUTCDate() + 2);

  const { data: existing } = await supabase
    .from('appointments')
    .select('scheduled_at, duration_minutes')
    .eq('business_id', businessId)
    .gte('scheduled_at', dayBefore.toISOString())
    .lte('scheduled_at', dayAfter.toISOString())
    .not('status', 'eq', 'cancelled');

  const booked = bookedSlotSet(existing || [], date, timeZone);

  return buildSlotGrid(hours.open_time, hours.close_time, durationMinutes)
    .filter((slot) => !booked.has(slot));
}
