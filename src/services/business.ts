import { createClient } from '@/lib/supabase/client';
import type { Business, BusinessHours } from '@/types';
import type { BusinessFormData } from '@/validations';
import { generateSlug } from '@/lib/utils';

export async function getMyBusiness(): Promise<Business | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  return data;
}

export async function createBusiness(
  userId: string,
  data: BusinessFormData & { business_name?: string }
): Promise<Business> {
  const supabase = createClient();
  const name = data.name || (data as { business_name?: string }).business_name || '';
  const slug = generateSlug(name) + '-' + Math.random().toString(36).substring(2, 6);

  const { data: business, error } = await supabase
    .from('businesses')
    .insert({
      owner_id: userId,
      name,
      slug,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      zip: data.zip || null,
      website: data.website || null,
      timezone: data.timezone || 'America/New_York',
    })
    .select()
    .single();

  if (error) throw error;

  // Seed default business hours
  await supabase.rpc('create_default_business_hours', {
    p_business_id: business.id,
  });

  return business;
}

export async function updateBusiness(
  businessId: string,
  data: Partial<BusinessFormData>
): Promise<Business> {
  const supabase = createClient();

  const { data: business, error } = await supabase
    .from('businesses')
    .update({
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      zip: data.zip || null,
      website: data.website || null,
      timezone: data.timezone,
    })
    .eq('id', businessId)
    .select()
    .single();

  if (error) throw error;
  return business;
}

export async function getBusinessHours(businessId: string): Promise<BusinessHours[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('business_hours')
    .select('*')
    .eq('business_id', businessId)
    .order('day_of_week');

  if (error) throw error;
  return data || [];
}

export async function updateBusinessHours(
  businessId: string,
  hours: Array<{
    day_of_week: number;
    is_open: boolean;
    open_time?: string | null;
    close_time?: string | null;
  }>
): Promise<void> {
  const supabase = createClient();

  for (const hour of hours) {
    await supabase
      .from('business_hours')
      .upsert({
        business_id: businessId,
        day_of_week: hour.day_of_week,
        is_open: hour.is_open,
        open_time: hour.is_open ? (hour.open_time || null) : null,
        close_time: hour.is_open ? (hour.close_time || null) : null,
      }, {
        onConflict: 'business_id,day_of_week',
      });
  }
}
