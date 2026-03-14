export type ProjectStatus = 'draft' | 'processing' | 'completed' | 'failed';
export type AssetStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Project {
  id: string;
  user_id: string;
  title: string;
  input_text: string | null;
  music_vibe: string | null;
  music_url: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface Scene {
  id: string;
  project_id: string;
  scene_number: number;
  script_text: string | null;
  visual_prompt: string | null;
  video_task_id: string | null;
  video_url: string | null;
  audio_url: string | null;
  video_status: AssetStatus;
  audio_status: AssetStatus;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Project, 'id' | 'created_at'>>;
      };
      scenes: {
        Row: Scene;
        Insert: Omit<Scene, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Scene, 'id' | 'created_at'>>;
      };
    };
  };
}
