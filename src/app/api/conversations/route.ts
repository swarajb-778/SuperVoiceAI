import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/admin';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

function deriveSentiment(messages: Array<{ role: string; content: string }>): string | null {
  const userMessages = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content.toLowerCase())
    .join(' ');

  if (!userMessages) return null;

  const positiveWords = ['thank', 'great', 'perfect', 'awesome', 'excellent', 'love', 'wonderful', 'amazing', 'happy', 'good', 'appreciate', 'helpful', 'fantastic', 'pleased'];
  const negativeWords = ['problem', 'issue', 'terrible', 'bad', 'awful', 'hate', 'frustrated', 'angry', 'upset', 'worst', 'disappointed', 'useless', 'broken', 'wrong', 'horrible'];

  const positiveScore = positiveWords.filter((w) => userMessages.includes(w)).length;
  const negativeScore = negativeWords.filter((w) => userMessages.includes(w)).length;

  if (positiveScore === 0 && negativeScore === 0) return 'neutral';
  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
}

export async function PATCH(req: NextRequest) {
  try {
    const { conversationId, updates } = await req.json() as {
      conversationId: string;
      updates: { status?: string; duration_seconds?: number; appointment_booked?: boolean; callback_requested?: boolean };
    };

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId required' }, { status: 400 });
    }

    const supabase = createAdminSupabase();

    // When marking completed, auto-derive sentiment from the transcript
    const finalUpdates: Record<string, unknown> = { ...updates };
    if (updates.status === 'completed') {
      const { data: messages } = await supabase
        .from('conversation_messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .in('role', ['user', 'assistant']);

      if (messages && messages.length > 0) {
        finalUpdates.sentiment = deriveSentiment(messages);
      }
    }

    const { error } = await supabase
      .from('conversations')
      .update(finalUpdates)
      .eq('id', conversationId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { conversationId, role, content } = await req.json() as {
      conversationId: string;
      role: 'user' | 'assistant' | 'system' | 'tool';
      content: string;
    };

    if (!conversationId || !role || !content) {
      return NextResponse.json({ error: 'conversationId, role and content required' }, { status: 400 });
    }

    const supabase = createAdminSupabase();

    await supabase.from('conversation_messages').insert({
      conversation_id: conversationId,
      role,
      content,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}
