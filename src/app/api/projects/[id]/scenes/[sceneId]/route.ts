import { ERROR_MESSAGES } from '@/constants';
import { db } from '@/db';
import { projects, scenes } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { toSnakeCase } from '@/lib/utils';
import { and, eq, inArray } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sceneId: string }> }
) {
  try {
    const { id, sceneId } = await params;
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
    const {
      script_text,
      visual_prompt,
      video_task_id,
      video_url,
      audio_url,
      video_status,
      audio_status,
    } = body;

    const updateData: Record<string, unknown> = {};
    if (script_text !== undefined) updateData.scriptText = script_text;
    if (visual_prompt !== undefined) updateData.visualPrompt = visual_prompt;
    if (video_task_id !== undefined) updateData.videoTaskId = video_task_id;
    if (video_url !== undefined) updateData.videoUrl = video_url;
    if (audio_url !== undefined) updateData.audioUrl = audio_url;
    if (video_status !== undefined) updateData.videoStatus = video_status;
    if (audio_status !== undefined) updateData.audioStatus = audio_status;

    const result = await db
      .update(scenes)
      .set(updateData)
      .where(and(eq(scenes.id, sceneId), eq(scenes.projectId, id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: ERROR_MESSAGES.SCENE_NOT_FOUND }, { status: 404 });
    }

    // ═══════════════════════════════════════════════════════════
    // Project Status Lifecycle Management
    // ═══════════════════════════════════════════════════════════

    // 1. If any scene is currently processing, the project should be marked as processing
    if (video_status === 'processing' || audio_status === 'processing') {
      await db
        .update(projects)
        .set({ status: 'processing' as const })
        .where(eq(projects.id, id));
    }

    // 2. If a scene finished (completed or failed), check if we can move the project out of 'processing'
    if (
      video_status === 'completed' ||
      video_status === 'failed' ||
      audio_status === 'completed' ||
      audio_status === 'failed'
    ) {
      // Check for any other scenes that are currently 'processing'
      const activeScenes = await db
        .select({ id: scenes.id })
        .from(scenes)
        .where(
          and(
            eq(scenes.projectId, id),
            inArray(scenes.videoStatus, ['processing'])
            // We could also check audioStatus if we want to block the dashboard on audio gen
          )
        )
        .limit(1);

      // If no scenes are actively processing anymore
      if (activeScenes.length === 0) {
        // Check if all scenes are finished (completed or failed)
        const pendingScenes = await db
          .select({ id: scenes.id })
          .from(scenes)
          .where(
            and(eq(scenes.projectId, id), inArray(scenes.videoStatus, ['pending', 'processing']))
          )
          .limit(1);

        if (pendingScenes.length === 0) {
          // Everything is done! Check if there's any failure to decide between 'completed' and 'failed'
          const failedScenes = await db
            .select({ id: scenes.id })
            .from(scenes)
            .where(and(eq(scenes.projectId, id), eq(scenes.videoStatus, 'failed')))
            .limit(1);

          await db
            .update(projects)
            .set({ status: failedScenes.length > 0 ? 'failed' : 'completed' })
            .where(eq(projects.id, id));
        }
        // Note: Don't set back to 'draft' if there are pending scenes
        // If project was 'processing', it should stay 'processing' until ALL videos are done
      }
    }

    return NextResponse.json({ scene: toSnakeCase(result[0]) });
  } catch (error) {
    console.error('Error updating scene:', error);
    return NextResponse.json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
