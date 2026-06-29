import { NextRequest, NextResponse } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// Proxy WebRTC SDP offer to OpenAI GA Realtime API (/v1/realtime/calls).
// Session config + SDP sent together as multipart/form-data.
// API key stays server-side.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      sdp: string;
      model: string;
      voice: string;
      instructions: string;
      tools: unknown[];
      turnDetection: Record<string, unknown>;
    };

    const sessionConfig = JSON.stringify({
      type: 'realtime',
      model: body.model || 'gpt-realtime',
      instructions: body.instructions,
      tools: body.tools,
      tool_choice: 'auto',
    });

    // Build multipart body manually to avoid Node.js FormData issues with Blob filenames
    const boundary = `OpenAIBoundary${Date.now()}`;
    const CRLF = '\r\n';

    const sdpBytes = Buffer.from(body.sdp, 'utf8');
    const sessionBytes = Buffer.from(sessionConfig, 'utf8');

    const part1Header = Buffer.from(
      `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="sdp"${CRLF}` +
      `Content-Type: application/sdp${CRLF}` +
      CRLF,
      'utf8'
    );
    const part2Header = Buffer.from(
      `${CRLF}--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="session"${CRLF}` +
      CRLF,
      'utf8'
    );
    const closing = Buffer.from(`${CRLF}--${boundary}--${CRLF}`, 'utf8');

    const multipartBody = Buffer.concat([part1Header, sdpBytes, part2Header, sessionBytes, closing]);

    const sdpRes = await fetch('https://api.openai.com/v1/realtime/calls', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': String(multipartBody.byteLength),
      },
      body: multipartBody,
    });

    const responseText = await sdpRes.text();
    console.log('[connect] OpenAI status:', sdpRes.status, 'response:', responseText.slice(0, 300));

    if (!sdpRes.ok) {
      return new NextResponse(responseText, {
        status: sdpRes.status,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    return new NextResponse(responseText, {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/sdp' },
    });
  } catch (err) {
    console.error('[connect] error:', err);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
}
