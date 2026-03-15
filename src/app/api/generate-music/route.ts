import { ERROR_MESSAGES, MAX_DURATION } from '@/constants';
import { getMiniMaxClient } from '@/lib/minimax';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Next.js Route Segment Config — tells Vercel to allow this function to run longer
export const maxDuration = MAX_DURATION.MUSIC;

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
    const { prompt, lyrics } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: ERROR_MESSAGES.MISSING_PROMPT }, { status: 400 });
    }

    const client = getMiniMaxClient();

    const audioBuffer = await client.generateMusic(prompt, lyrics);

    const supabase = getSupabaseAdmin();

    const filename = `music-${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;

    const { error } = await supabase.storage.from('music').upload(filename, audioBuffer, {
      contentType: 'audio/mpeg',
      upsert: false,
    });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json({ error: ERROR_MESSAGES.UPLOAD_FAILED }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from('music').getPublicUrl(filename);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error('Music generation error:', error);

    if (error instanceof Error) {
      if (error.message.includes(ERROR_MESSAGES.MINIMAX_API_KEY_MISSING)) {
        return NextResponse.json({ error: ERROR_MESSAGES.MISSING_API_KEY }, { status: 500 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
