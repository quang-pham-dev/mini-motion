import { ERROR_MESSAGES } from '@/constants';
import { getMiniMaxClient } from '@/lib/minimax';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabaseAdmin() {
  if (!supabaseServiceKey) {
    throw new Error(ERROR_MESSAGES.SUPABASE_SERVICE_ROLE_KEY_MISSING);
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voiceId } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: ERROR_MESSAGES.MISSING_TEXT }, { status: 400 });
    }

    if (text.length > 1000) {
      return NextResponse.json({ error: ERROR_MESSAGES.TEXT_TOO_LONG }, { status: 400 });
    }

    const client = getMiniMaxClient();
    const audioBuffer = await client.generateTTS(text, voiceId);

    const supabase = getSupabaseAdmin();

    const filename = `tts-${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;

    const { error: uploadError } = await supabase.storage
      .from('music')
      .upload(filename, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ error: ERROR_MESSAGES.UPLOAD_FAILED }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from('music').getPublicUrl(filename);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error('TTS generation error:', error);

    if (error instanceof Error) {
      if (error.message.includes(ERROR_MESSAGES.MINIMAX_API_KEY_MISSING)) {
        return NextResponse.json({ error: ERROR_MESSAGES.MISSING_API_KEY }, { status: 500 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
