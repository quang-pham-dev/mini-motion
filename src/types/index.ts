import { AssetStatusType, ProjectStatusType as ProjectStatus } from '@/constants';
export type { ProjectStatus };

export interface Scene {
  id: string;
  scene_number: number;
  script_text: string;
  visual_prompt: string;
  video_task_id: string | null;
  video_url: string | null;
  audio_url: string | null;
  video_status: AssetStatusType;
  audio_status: AssetStatusType;
}

export interface ScriptScene {
  text: string;
  visual_description: string;
}

export interface ScriptOutput {
  title: string;
  scenes: ScriptScene[];
  music_suggestion: string;
}

export interface Project {
  id: string;
  title: string;
  status: ProjectStatus;
  created_at: string;
  music_vibe?: string;
  music_url?: string | null;
  scenes: Scene[];
}
