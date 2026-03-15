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
      .select({ id: projects.id })
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

    return NextResponse.json({ scenes: toSnakeCase({ scenes: scenesResult }).scenes });
  } catch (error) {
    console.error('Error fetching scenes:', error);
    return NextResponse.json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
      .limit(1);

    if (projectResult.length === 0) {
      return NextResponse.json({ error: ERROR_MESSAGES.PROJECT_NOT_FOUND }, { status: 404 });
    }

    const body = await request.json();
    const { scenes: scenesArray } = body;

    if (!Array.isArray(scenesArray) || scenesArray.length === 0) {
      return NextResponse.json({ error: ERROR_MESSAGES.MISSING_SCENES }, { status: 400 });
    }

    const scenesToInsert = scenesArray.map(
      (scene: { text: string; visual_description: string }, index: number) => ({
        projectId: id,
        sceneNumber: index + 1,
        scriptText: scene.text || null,
        visualPrompt: scene.visual_description || null,
        videoStatus: 'pending' as const,
        audioStatus: 'pending' as const,
      })
    );

    const insertedScenes = await db.insert(scenes).values(scenesToInsert).returning();

    await db
      .update(projects)
      .set({ status: 'draft' as const })
      .where(eq(projects.id, id));

    return NextResponse.json({ scenes: insertedScenes });
  } catch (error) {
    console.error('Error creating scenes:', error);
    return NextResponse.json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
