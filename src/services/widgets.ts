import { createClient } from '@/lib/supabase/client';
import type { EmbeddedWidget } from '@/types';
import type { WidgetFormData } from '@/validations';

export async function getWidgets(businessId: string): Promise<EmbeddedWidget[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('embedded_widgets')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getWidget(widgetId: string): Promise<EmbeddedWidget | null> {
  const supabase = createClient();

  const { data } = await supabase
    .from('embedded_widgets')
    .select('*')
    .eq('id', widgetId)
    .single();

  return data;
}

export async function createWidget(
  businessId: string,
  data: WidgetFormData
): Promise<EmbeddedWidget> {
  const supabase = createClient();

  const { data: widget, error } = await supabase
    .from('embedded_widgets')
    .insert({
      business_id: businessId,
      agent_id: data.agent_id || null,
      name: data.name,
      position: data.position,
      primary_color: data.primary_color,
      greeting: data.greeting || null,
      is_active: data.is_active,
      allowed_domains: data.allowed_domains?.length ? data.allowed_domains : null,
    })
    .select()
    .single();

  if (error) throw error;
  return widget;
}

export async function updateWidget(
  widgetId: string,
  data: Partial<WidgetFormData>
): Promise<EmbeddedWidget> {
  const supabase = createClient();

  const { data: widget, error } = await supabase
    .from('embedded_widgets')
    .update({
      agent_id: data.agent_id || null,
      name: data.name,
      position: data.position,
      primary_color: data.primary_color,
      greeting: data.greeting || null,
      is_active: data.is_active,
      allowed_domains: data.allowed_domains?.length ? data.allowed_domains : null,
    })
    .eq('id', widgetId)
    .select()
    .single();

  if (error) throw error;
  return widget;
}

export async function deleteWidget(widgetId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('embedded_widgets')
    .delete()
    .eq('id', widgetId);

  if (error) throw error;
}

export async function getWidgetByBusiness(businessId: string): Promise<EmbeddedWidget | null> {
  const supabase = createClient();

  const { data } = await supabase
    .from('embedded_widgets')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  return data;
}
