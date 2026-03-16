import { db } from '@/db';
import { projects, scenes } from '@/db/schema';
import { and, eq, inArray, or } from 'drizzle-orm';

/**
 * Resolves the correct project status based on the CURRENT state of all its scenes.
 *
 * Logic:
 * - If ANY scene has videoStatus or audioStatus = 'processing' → project = 'processing'
 * - If NO scenes are processing AND at least one asset has ever been generated → project = 'completed' or 'failed'
 * - If nothing has been generated yet → project stays 'draft'
 *
 * A scene is considered "actively working" if its videoStatus OR audioStatus is 'processing'.
 * A project is "completed" when no scenes are actively processing AND at least one asset exists.
 */
export async function resolveProjectStatus(projectId: string): Promise<void> {
  // 1. Check if any scene is currently processing (video OR audio)
  const processingScenes = await db
    .select({ id: scenes.id })
    .from(scenes)
    .where(
      and(
        eq(scenes.projectId, projectId),
        or(eq(scenes.videoStatus, 'processing'), eq(scenes.audioStatus, 'processing'))
      )
    )
    .limit(1);

  if (processingScenes.length > 0) {
    // Something is still processing → project is processing
    await db
      .update(projects)
      .set({ status: 'processing' as const })
      .where(eq(projects.id, projectId));
    return;
  }

  // 2. Nothing is processing. Check if ANY asset has been generated (completed or failed)
  const generatedScenes = await db
    .select({ id: scenes.id })
    .from(scenes)
    .where(
      and(
        eq(scenes.projectId, projectId),
        or(
          inArray(scenes.videoStatus, ['completed', 'failed']),
          inArray(scenes.audioStatus, ['completed', 'failed'])
        )
      )
    )
    .limit(1);

  if (generatedScenes.length === 0) {
    // Nothing has been generated yet — stay as draft
    return;
  }

  // 3. At least one asset has been generated and nothing is processing.
  //    Check for any failures to decide between 'completed' and 'failed'.
  const failedScenes = await db
    .select({ id: scenes.id })
    .from(scenes)
    .where(
      and(
        eq(scenes.projectId, projectId),
        or(eq(scenes.videoStatus, 'failed'), eq(scenes.audioStatus, 'failed'))
      )
    )
    .limit(1);

  const finalStatus = failedScenes.length > 0 ? 'failed' : 'completed';

  await db
    .update(projects)
    .set({ status: finalStatus as 'completed' | 'failed' })
    .where(eq(projects.id, projectId));
}
