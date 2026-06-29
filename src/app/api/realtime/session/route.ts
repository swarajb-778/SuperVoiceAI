import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';
import { buildSystemPrompt, REALTIME_TOOLS } from '@/ai/tools';
import type { Business, Agent, Service, BusinessHours } from '@/types';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // ── Phase 1: config request (JSON, no SDP yet) ──────────────────────────
    // Widget calls this first to get session config + conversationId.
    if (contentType.includes('application/json')) {
      const { businessId, agentId } = await req.json();

      if (!businessId) {
        return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
      }

      const supabase = createAdminSupabase();

      const { data: business } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (!business) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 });
      }

      let agentQuery = supabase.from('agents').select('*').eq('is_active', true);
      if (agentId) {
        agentQuery = agentQuery.eq('id', agentId);
      } else {
        agentQuery = agentQuery.eq('business_id', businessId).limit(1);
      }
      const { data: agentRows } = await agentQuery;
      const agent = agentRows?.[0] || null;

      const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true);

      const { data: hours } = await supabase
        .from('business_hours')
        .select('*')
        .eq('business_id', businessId)
        .order('day_of_week');

      const { data: faqs } = await supabase
        .from('faqs')
        .select('question, answer')
        .eq('business_id', businessId)
        .eq('is_active', true);

      const agentTyped = agent as Agent | null;

      const systemPrompt = buildSystemPrompt(
        business as Business,
        (services || []) as Service[],
        (hours || []) as BusinessHours[],
        agentTyped?.system_prompt || null,
        (faqs || []) as Array<{ question: string; answer: string }>,
        agentTyped?.language || 'en',
        agentTyped?.greeting_message || null
      );

      const { data: conversation } = await supabase
        .from('conversations')
        .insert({
          business_id: businessId,
          agent_id: agentTyped?.id || null,
          status: 'active' as const,
          source: 'widget' as const,
        })
        .select()
        .single();

      if (conversation) {
        await supabase.from('analytics_events').insert({
          business_id: businessId,
          conversation_id: conversation.id,
          event_type: 'conversation_started',
          event_data: { agent_id: agentTyped?.id, source: 'widget' },
        });
      }

      const sensitivity = agentTyped?.interrupt_sensitivity || 'medium';

      return NextResponse.json({
        conversationId: conversation?.id,
        agentName: agentTyped?.name || 'AI Receptionist',
        voice: agentTyped?.voice || 'alloy',
        model: 'gpt-realtime',
        systemPrompt,
        tools: REALTIME_TOOLS,
        turnDetection: {
          type: 'server_vad',
          threshold: sensitivity === 'low' ? 0.9 : sensitivity === 'high' ? 0.5 : 0.7,
          prefix_padding_ms: 300,
          silence_duration_ms: sensitivity === 'low' ? 800 : sensitivity === 'high' ? 400 : 600,
        },
      }, { headers: CORS });
    }

    // SDP proxy moved to /api/realtime/connect
    return NextResponse.json({ error: 'Use /api/realtime/connect for SDP exchange' }, { status: 400 });

  } catch (err) {
    console.error('Session route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
