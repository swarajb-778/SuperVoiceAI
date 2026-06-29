import { createClient } from '@/lib/supabase/client';
import type { Agent } from '@/types';
import type { AgentFormData } from '@/validations';
import { DEFAULT_GREETING, DEFAULT_SYSTEM_PROMPT } from '@/constants';

export async function getAgents(businessId: string): Promise<Agent[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAgent(agentId: string): Promise<Agent | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .single();

  if (error) return null;
  return data;
}

export async function createAgent(
  businessId: string,
  data: AgentFormData
): Promise<Agent> {
  const supabase = createClient();

  const { data: agent, error } = await supabase
    .from('agents')
    .insert({
      business_id: businessId,
      name: data.name,
      voice: data.voice,
      language: data.language,
      personality: data.personality,
      greeting_message: data.greeting_message || DEFAULT_GREETING,
      system_prompt: data.system_prompt || DEFAULT_SYSTEM_PROMPT,
      max_call_duration: data.max_call_duration,
      interrupt_sensitivity: data.interrupt_sensitivity,
      is_active: data.is_active,
    })
    .select()
    .single();

  if (error) throw error;
  return agent;
}

export async function updateAgent(
  agentId: string,
  data: Partial<AgentFormData>
): Promise<Agent> {
  const supabase = createClient();

  const { data: agent, error } = await supabase
    .from('agents')
    .update({
      name: data.name,
      voice: data.voice,
      language: data.language,
      personality: data.personality,
      greeting_message: data.greeting_message || null,
      system_prompt: data.system_prompt || null,
      max_call_duration: data.max_call_duration,
      interrupt_sensitivity: data.interrupt_sensitivity,
      is_active: data.is_active,
    })
    .eq('id', agentId)
    .select()
    .single();

  if (error) throw error;
  return agent;
}

export async function deleteAgent(agentId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('agents')
    .delete()
    .eq('id', agentId);

  if (error) throw error;
}

export async function toggleAgentStatus(agentId: string, isActive: boolean): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('agents')
    .update({ is_active: isActive })
    .eq('id', agentId);

  if (error) throw error;
}
