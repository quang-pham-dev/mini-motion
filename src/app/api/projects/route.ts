import { ERROR_MESSAGES } from '@/constants';
import { db } from '@/db';
import { projects } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { toSnakeCase } from '@/lib/utils';
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 });
    }

    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, user.id))
      .orderBy(desc(projects.createdAt));

    return NextResponse.json({ projects: toSnakeCase({ projects: result }).projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 });
    }

    const body = await request.json();
    const { title, input_text, music_vibe } = body;

    if (!title) {
      return NextResponse.json({ error: ERROR_MESSAGES.MISSING_TITLE }, { status: 400 });
    }

    const result = await db
      .insert(projects)
      .values({
        userId: user.id,
        title,
        inputText: input_text || null,
        musicVibe: music_vibe || null,
        status: 'draft',
      })
      .returning();

    return NextResponse.json({ project: toSnakeCase(result[0]) });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
