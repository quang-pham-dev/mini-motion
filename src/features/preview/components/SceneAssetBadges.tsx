import { Scene } from '@/types';
import { Film, Mic } from 'lucide-react';

interface SceneAssetBadgesProps {
  scene: Scene;
}

export function SceneAssetBadges({ scene }: SceneAssetBadgesProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Video badge */}
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
          scene.video_status === 'completed'
            ? 'bg-green-100 text-green-700'
            : scene.video_status === 'processing'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-500'
        }`}
      >
        <Film className="h-3 w-3" />
        {scene.video_status === 'completed'
          ? 'Video ✓'
          : scene.video_status === 'processing'
            ? 'Video...'
            : 'Video'}
      </span>

      {/* Voiceover badge */}
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
          scene.audio_status === 'completed'
            ? 'bg-green-100 text-green-700'
            : scene.audio_status === 'processing'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-500'
        }`}
      >
        <Mic className="h-3 w-3" />
        {scene.audio_status === 'completed'
          ? 'Voice ✓'
          : scene.audio_status === 'processing'
            ? 'Voice...'
            : 'Voice'}
      </span>
    </div>
  );
}
