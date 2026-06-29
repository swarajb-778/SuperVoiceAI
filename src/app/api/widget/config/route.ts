import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ error: 'businessId required' }, { status: 400 });
    }

    const supabase = createAdminSupabase();

    const { data: business } = await supabase
      .from('businesses')
      .select('id, name, phone, city, state')
      .eq('id', businessId)
      .single();

    const { data: widget } = await supabase
      .from('embedded_widgets')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .limit(1)
      .single();

    const { data: agent } = await supabase
      .from('agents')
      .select('id, name, voice, greeting_message')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    if (widget) {
      await supabase
        .from('embedded_widgets')
        .update({ total_impressions: (widget.total_impressions || 0) + 1 })
        .eq('id', widget.id);
    }

    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cache-Control', 'no-store');

    return NextResponse.json({
      business: {
        id: business.id,
        name: business.name,
        city: business.city,
        state: business.state,
      },
      widget: widget ? {
        position: widget.position,
        primary_color: widget.primary_color,
        greeting: widget.greeting,
      } : { position: 'bottom-right', primary_color: '#22c55e' },
      agent: agent ? {
        id: agent.id,
        name: agent.name,
        greeting: agent.greeting_message,
      } : null,
    }, { headers });
  } catch {
    return NextResponse.json({ error: 'Failed to load config' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
