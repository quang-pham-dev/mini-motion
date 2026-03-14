CREATE TYPE "public"."project_status" AS ENUM('draft', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"input_text" text,
	"music_vibe" text,
	"music_url" text,
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"scene_number" integer NOT NULL,
	"script_text" text,
	"visual_prompt" text,
	"video_task_id" text,
	"video_url" text,
	"audio_url" text,
	"video_status" "task_status" DEFAULT 'pending' NOT NULL,
	"audio_status" "task_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "scenes" ADD CONSTRAINT "scenes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_projects_user_id" ON "projects" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_projects_status" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_projects_user_id_created_at" ON "projects" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_scenes_project_id" ON "scenes" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_scenes_scene_number" ON "scenes" USING btree ("scene_number");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_scenes_project_id_scene_number" ON "scenes" USING btree ("project_id","scene_number");--> statement-breakpoint
CREATE UNIQUE INDEX "scenes_project_id_scene_number_key" ON "scenes" USING btree ("project_id","scene_number");