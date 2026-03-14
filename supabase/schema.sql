-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types for status fields
DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('draft', 'processing', 'completed', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  input_text TEXT,
  music_vibe TEXT,
  music_url TEXT,
  status project_status DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scenes table
CREATE TABLE IF NOT EXISTS scenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  scene_number INTEGER NOT NULL,
  script_text TEXT,
  visual_prompt TEXT,
  video_task_id TEXT,
  video_url TEXT,
  audio_url TEXT,
  video_status task_status DEFAULT 'pending',
  audio_status task_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (project_id, scene_number)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_user_id_created_at ON projects(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_scenes_project_id ON scenes(project_id);
CREATE INDEX IF NOT EXISTS idx_scenes_scene_number ON scenes(scene_number);
CREATE INDEX IF NOT EXISTS idx_scenes_project_id_scene_number ON scenes(project_id, scene_number);

-- Partial indexes for common queries
CREATE INDEX IF NOT EXISTS idx_projects_processing ON projects(status) WHERE status = 'processing';
CREATE INDEX IF NOT EXISTS idx_scenes_video_processing ON scenes(video_status) WHERE video_status = 'processing';
CREATE INDEX IF NOT EXISTS idx_scenes_audio_processing ON scenes(audio_status) WHERE audio_status = 'processing';

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;

-- RLS Helper function to check project ownership
CREATE OR REPLACE FUNCTION auth_user_owns_project(p_project_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects 
    WHERE id = p_project_id 
    AND user_id = auth.uid()
  );
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for projects
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for scenes (using helper function)
CREATE POLICY "Users can view scenes of their own projects" ON scenes
  FOR SELECT USING (auth_user_owns_project(project_id));

CREATE POLICY "Users can insert scenes for their own projects" ON scenes
  FOR INSERT WITH CHECK (auth_user_owns_project(project_id));

CREATE POLICY "Users can update scenes of their own projects" ON scenes
  FOR UPDATE USING (auth_user_owns_project(project_id));

CREATE POLICY "Users can delete scenes of their own projects" ON scenes
  FOR DELETE USING (auth_user_owns_project(project_id));

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenes_updated_at BEFORE UPDATE ON scenes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
