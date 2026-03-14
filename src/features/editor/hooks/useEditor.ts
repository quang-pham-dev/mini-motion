import { APP_CONFIG } from '@/config';
import { ERROR_MESSAGES } from '@/constants';
import { ScriptOutput } from '@/types';
import { type User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function useEditor(user: User | null) {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [script, setScript] = useState<ScriptOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateScript = async () => {
    if (!inputText.trim() || inputText.length < APP_CONFIG.MIN_SCRIPT_LENGTH) {
      setError(`Please enter at least ${APP_CONFIG.MIN_SCRIPT_LENGTH} characters of text`);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || ERROR_MESSAGES.GENERATE_SCRIPT_FAILED);
      }

      setScript(data.script);
      if (data.script.title) {
        setTitle(data.script.title);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndGenerate = async () => {
    if (!script || !user) return;

    try {
      const projectResponse = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Untitled Project',
          input_text: inputText,
          music_vibe: script.music_suggestion,
        }),
      });

      const projectData = await projectResponse.json();
      if (!projectResponse.ok) {
        throw new Error(projectData.error || ERROR_MESSAGES.CREATE_PROJECT_FAILED);
      }

      const newProjectId = projectData.project.id;

      const scenesResponse = await fetch(`/ api / projects / ${newProjectId}/scenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenes: script.scenes }),
      });

      const scenesData = await scenesResponse.json();
      if (!scenesResponse.ok) {
        throw new Error(scenesData.error || ERROR_MESSAGES.SAVE_SCENES_FAILED);
      }

      router.push(`/preview/${newProjectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project');
    }
  };

  return {
    inputText,
    setInputText,
    title,
    setTitle,
    isGenerating,
    script,
    error,
    handleGenerateScript,
    handleSaveAndGenerate,
  };
}
