import { createClient } from '@/lib/supabase/client';
import type { Service } from '@/types';
import type { ServiceFormData } from '@/validations';

export async function getServices(businessId: string): Promise<Service[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createService(
  businessId: string,
  data: ServiceFormData
): Promise<Service> {
  const supabase = createClient();

  const { data: service, error } = await supabase
    .from('services')
    .insert({
      business_id: businessId,
      name: data.name,
      description: data.description || null,
      duration_minutes: data.duration_minutes,
      price_type: data.price_type,
      price_min: data.price_min ?? null,
      price_max: data.price_max ?? null,
      is_active: data.is_active,
      sort_order: data.sort_order,
    })
    .select()
    .single();

  if (error) throw error;
  return service;
}

export async function updateService(
  serviceId: string,
  data: Partial<ServiceFormData>
): Promise<Service> {
  const supabase = createClient();

  const { data: service, error } = await supabase
    .from('services')
    .update({
      name: data.name,
      description: data.description || null,
      duration_minutes: data.duration_minutes,
      price_type: data.price_type,
      price_min: data.price_min ?? null,
      price_max: data.price_max ?? null,
      is_active: data.is_active,
      sort_order: data.sort_order,
    })
    .eq('id', serviceId)
    .select()
    .single();

  if (error) throw error;
  return service;
}

export async function deleteService(serviceId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', serviceId);

  if (error) throw error;
}
