import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';
import { staleCutoff, STALE_CONVERSATION_MS } from '@/lib/conversations';

/**
 * Closes conversations that were left 'active' by a client that never came back.
 *
 * Both clients close their own calls, including on an unexpected ICE drop, but no amount of
 * client code covers a tab close, a browser crash, a suspended laptop or a dead network —
 * the page simply stops executing. Those rows would otherwise stay 'active' forever and sit
 * in the conversion-rate denominator, permanently understating it.
 *
 * Scheduled hourly via vercel.json. Idempotent: rows already closed no longer match.
 */
export async function GET(req: NextRequest) {
  // Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Without the secret configured
  // the endpoint stays closed rather than defaulting to publicly runnable.
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createAdminSupabase();

    const { data, error } = await supabase
      .from('conversations')
      .update({ status: 'abandoned' })
      .eq('status', 'active')
      .lt('created_at', staleCutoff())
      .select('id');

    if (error) throw error;

    const swept = data?.length ?? 0;
    if (swept > 0) {
      console.log(`[cron] closed ${swept} stale conversation(s) as abandoned`);
    }

    return NextResponse.json({
      swept,
      olderThanMinutes: STALE_CONVERSATION_MS / 60_000,
    });
  } catch (err) {
    console.error('[cron] close-stale-conversations failed:', err);
    return NextResponse.json({ error: 'Sweep failed' }, { status: 500 });
  }
}
