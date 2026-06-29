import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';
import { getAvailableSlots } from '@/services/appointments';
import type { Business } from '@/types';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { toolName, toolArgs, businessId, conversationId } = await req.json();

    if (!businessId || !toolName) {
      return NextResponse.json({ error: 'businessId and toolName are required' }, { status: 400 });
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

    const biz = business as Business;
    let result: unknown;

    switch (toolName) {
      case 'getBusinessHours': {
        const { data: hours } = await supabase
          .from('business_hours')
          .select('*')
          .eq('business_id', businessId)
          .order('day_of_week');

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        result = {
          hours: (hours || []).map((h) => ({
            day: days[h.day_of_week],
            is_open: h.is_open,
            open_time: h.open_time,
            close_time: h.close_time,
          })),
          timezone: biz.timezone,
        };
        break;
      }

      case 'getServices': {
        const { data: services } = await supabase
          .from('services')
          .select('*')
          .eq('business_id', businessId)
          .eq('is_active', true)
          .order('sort_order');

        result = {
          services: (services || []).map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            duration_minutes: s.duration_minutes,
            price_type: s.price_type,
            price_min: s.price_min,
            price_max: s.price_max,
          })),
        };
        break;
      }

      case 'getAvailableSlots': {
        const { date, service_id } = toolArgs as { date: string; service_id?: string };
        if (!date) {
          result = { error: 'Date is required' };
          break;
        }

        let duration = 60;
        if (service_id) {
          const { data: service } = await supabase
            .from('services')
            .select('duration_minutes')
            .eq('id', service_id)
            .single();
          if (service) duration = service.duration_minutes;
        }

        const slots = await getAvailableSlots(businessId, date, duration);
        result = {
          date,
          available_slots: slots,
          message: slots.length === 0 ? 'No available slots for this date' : `${slots.length} slots available`,
        };
        break;
      }

      case 'createAppointment': {
        const args = toolArgs as {
          customer_name: string;
          customer_phone?: string;
          customer_email?: string;
          vehicle_year?: string;
          vehicle_make?: string;
          vehicle_model?: string;
          service_id?: string;
          scheduled_at: string;
          notes?: string;
        };

        if (!args.customer_name || !args.scheduled_at) {
          result = { error: 'Customer name and scheduled time are required' };
          break;
        }

        const { data: appointment, error } = await supabase
          .from('appointments')
          .insert({
            business_id: businessId,
            conversation_id: conversationId || null,
            service_id: args.service_id || null,
            customer_name: args.customer_name,
            customer_phone: args.customer_phone || null,
            customer_email: args.customer_email || null,
            vehicle_year: args.vehicle_year || null,
            vehicle_make: args.vehicle_make || null,
            vehicle_model: args.vehicle_model || null,
            scheduled_at: args.scheduled_at,
            notes: args.notes || null,
            status: 'confirmed' as const,
            duration_minutes: 60,
          })
          .select()
          .single();

        if (error) {
          result = { error: 'Failed to create appointment', details: error.message };
          break;
        }

        if (conversationId && appointment) {
          await supabase
            .from('conversations')
            .update({
              appointment_booked: true,
              caller_name: args.customer_name || null,
              caller_phone: args.customer_phone || null,
            })
            .eq('id', conversationId);

          await supabase.from('analytics_events').insert({
            business_id: businessId,
            conversation_id: conversationId,
            event_type: 'appointment_booked',
            event_data: { appointment_id: appointment.id, service_id: args.service_id },
          });
        }

        result = {
          success: true,
          appointment_id: appointment?.id,
          message: `Appointment confirmed for ${args.customer_name} on ${new Date(args.scheduled_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}.`,
        };
        break;
      }

      case 'createLead': {
        const args = toolArgs as {
          name: string;
          phone: string;
          email?: string;
          vehicle_year?: string;
          vehicle_make?: string;
          vehicle_model?: string;
          service_interest?: string;
          notes?: string;
        };

        if (!args.name || !args.phone) {
          result = { error: 'Name and phone are required' };
          break;
        }

        const { data: lead, error } = await supabase
          .from('leads')
          .insert({
            business_id: businessId,
            conversation_id: conversationId || null,
            name: args.name,
            phone: args.phone || null,
            email: args.email || null,
            vehicle_year: args.vehicle_year || null,
            vehicle_make: args.vehicle_make || null,
            vehicle_model: args.vehicle_model || null,
            service_interest: args.service_interest || null,
            notes: args.notes || null,
            status: 'new' as const,
          })
          .select()
          .single();

        if (error) {
          result = { error: 'Failed to create lead' };
          break;
        }

        if (conversationId && lead) {
          await supabase
            .from('conversations')
            .update({ caller_name: args.name || null, caller_phone: args.phone || null })
            .eq('id', conversationId);
        }

        result = {
          success: true,
          lead_id: lead?.id,
          message: `Lead captured for ${args.name}. The team will follow up with you soon.`,
        };
        break;
      }

      case 'requestCallback': {
        const args = toolArgs as { name: string; phone: string; preferred_time?: string; reason?: string };

        if (!args.name || !args.phone) {
          result = { error: 'Name and phone are required' };
          break;
        }

        await supabase.from('leads').insert({
          business_id: businessId,
          conversation_id: conversationId || null,
          name: args.name,
          phone: args.phone,
          notes: `Callback requested. Preferred time: ${args.preferred_time || 'Any time'}. Reason: ${args.reason || 'Not specified'}`,
          status: 'new' as const,
        });

        if (conversationId) {
          await supabase
            .from('conversations')
            .update({
              callback_requested: true,
              caller_name: args.name || null,
              caller_phone: args.phone || null,
            })
            .eq('id', conversationId);

          await supabase.from('analytics_events').insert({
            business_id: businessId,
            conversation_id: conversationId,
            event_type: 'callback_requested',
            event_data: { name: args.name, phone: args.phone, preferred_time: args.preferred_time },
          });
        }

        result = {
          success: true,
          message: `Callback scheduled for ${args.name} at ${args.phone}. ${args.preferred_time ? `Preferred time: ${args.preferred_time}.` : ''} The team will call you back shortly.`,
        };
        break;
      }

      default:
        result = { error: `Unknown tool: ${toolName}` };
    }

    if (conversationId) {
      await supabase.from('conversation_messages').insert({
        conversation_id: conversationId,
        role: 'tool' as const,
        content: JSON.stringify(result),
        tool_name: toolName,
        tool_result: result as Record<string, unknown>,
      });
    }

    return NextResponse.json({ result });
  } catch (err) {
    console.error('Tool execution error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
