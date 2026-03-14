import { ERROR_MESSAGES } from '@/constants';
import { db } from '@/db';
import { projects, scenes } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { toSnakeCase } from '@/lib/utils';
import { and, asc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 });
    }

    const projectResult = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
      .limit(1);

    if (projectResult.length === 0) {
      return NextResponse.json({ error: ERROR_MESSAGES.PROJECT_NOT_FOUND }, { status: 404 });
    }

    const scenesResult = await db
      .select()
      .from(scenes)
      .where(eq(scenes.projectId, id))
      .orderBy(asc(scenes.sceneNumber));

    const project = toSnakeCase({
      ...projectResult[0],
      scenes: scenesResult,
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 });
    }

    const body = await request.json();
    const { title, input_text, music_vibe, music_url, status } = body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (input_text !== undefined) updateData.inputText = input_text;
    if (music_vibe !== undefined) updateData.musicVibe = music_vibe;
    if (music_url !== undefined) updateData.musicUrl = music_url;
    if (status !== undefined) updateData.status = status;

    const result = await db
      .update(projects)
      .set(updateData)
      .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: ERROR_MESSAGES.PROJECT_NOT_FOUND }, { status: 404 });
    }

    return NextResponse.json({ project: toSnakeCase(result[0]) });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 });
    }

    const result = await db
      .delete(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
      .returning({ id: projects.id });

    if (result.length === 0) {
      return NextResponse.json({ error: ERROR_MESSAGES.PROJECT_NOT_FOUND }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
