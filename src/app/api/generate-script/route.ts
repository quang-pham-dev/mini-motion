import { ERROR_MESSAGES } from '@/constants';
import { getMiniMaxClient } from '@/lib/minimax';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inputText } = body;

    if (!inputText || typeof inputText !== 'string') {
      return NextResponse.json({ error: ERROR_MESSAGES.MISSING_INPUT_TEXT }, { status: 400 });
    }

    if (inputText.length < 50) {
      return NextResponse.json({ error: ERROR_MESSAGES.TEXT_TOO_SHORT }, { status: 400 });
    }

    const client = getMiniMaxClient();
    const script = await client.generateScript(inputText);

    return NextResponse.json({ script });
  } catch (error) {
    console.error('Script generation error:', error);

    if (error instanceof Error) {
      if (error.message.includes(ERROR_MESSAGES.MINIMAX_API_KEY_MISSING)) {
        return NextResponse.json({ error: ERROR_MESSAGES.MISSING_API_KEY }, { status: 500 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
