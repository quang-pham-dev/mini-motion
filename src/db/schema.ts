import { pgTable, uuid, text, timestamp, integer, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';

export const projectStatusEnum = pgEnum('project_status', [
  'draft',
  'processing',
  'completed',
  'failed',
]);
export const taskStatusEnum = pgEnum('task_status', [
  'pending',
  'processing',
  'completed',
  'failed',
]);

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    title: text('title').notNull(),
    inputText: text('input_text'),
    musicVibe: text('music_vibe'),
    musicUrl: text('music_url'),
    status: projectStatusEnum('status').default('draft').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => {
    return {
      userIdIdx: uniqueIndex('idx_projects_user_id').on(table.userId),
      statusIdx: uniqueIndex('idx_projects_status').on(table.status),
      userIdCreatedAtIdx: uniqueIndex('idx_projects_user_id_created_at').on(
        table.userId,
        table.createdAt
      ),
    };
  }
);

export const scenes = pgTable(
  'scenes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    sceneNumber: integer('scene_number').notNull(),
    scriptText: text('script_text'),
    visualPrompt: text('visual_prompt'),
    videoTaskId: text('video_task_id'),
    videoUrl: text('video_url'),
    audioUrl: text('audio_url'),
    videoStatus: taskStatusEnum('video_status').default('pending').notNull(),
    audioStatus: taskStatusEnum('audio_status').default('pending').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  table => {
    return {
      projectIdIdx: uniqueIndex('idx_scenes_project_id').on(table.projectId),
      sceneNumberIdx: uniqueIndex('idx_scenes_scene_number').on(table.sceneNumber),
      projectIdSceneNumberIdx: uniqueIndex('idx_scenes_project_id_scene_number').on(
        table.projectId,
        table.sceneNumber
      ),
      projectIdSceneNumberUnique: uniqueIndex('scenes_project_id_scene_number_key').on(
        table.projectId,
        table.sceneNumber
      ),
    };
  }
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Scene = typeof scenes.$inferSelect;
export type NewScene = typeof scenes.$inferInsert;
