import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scene } from '@/types';
import { CheckCircle, Film, Loader2, Mic, Music, Pause, Play, RefreshCw } from 'lucide-react';
import { SceneAssetBadges } from './SceneAssetBadges';

interface SceneCardProps {
  scene: Scene;
  index: number;
  isPlaying: boolean;
  hasMusic: boolean;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  generatingAsset: { type: string; index: number } | null;
  handlePlayScene: (index: number) => void;
  handleVideoEnded: () => void;
  handleGenerateAsset: (type: 'video' | 'audio', index: number) => void;
}

export function SceneCard({
  scene,
  index,
  isPlaying,
  hasMusic,
  videoRef,
  generatingAsset,
  handlePlayScene,
  handleVideoEnded,
  handleGenerateAsset,
}: SceneCardProps) {
  const canPlay = scene.video_status === 'completed' && scene.video_url;

  return (
    <Card className={isPlaying ? 'shadow-lg ring-2 ring-blue-500' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            Scene {scene.scene_number}
            {isPlaying && (
              <span className="inline-flex animate-pulse items-center gap-1 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-medium text-white">
                ▶ Playing
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <SceneAssetBadges scene={scene} />
            {scene.video_status === 'processing' && (
              <span className="flex items-center gap-1 text-sm text-blue-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                Generating...
              </span>
            )}
            {scene.video_status === 'failed' && (
              <Button variant="ghost" size="sm" onClick={() => handleGenerateAsset('video', index)}>
                <RefreshCw className="mr-1 h-3 w-3" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Video panel */}
          <div>
            <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-900">
              {scene.video_status === 'completed' && scene.video_url ? (
                <>
                  <video
                    ref={isPlaying && videoRef ? videoRef : undefined}
                    src={scene.video_url}
                    className="h-full w-full object-cover"
                    loop
                    muted={!isPlaying}
                    onEnded={handleVideoEnded}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30">
                    <Button
                      size="lg"
                      variant={isPlaying ? 'secondary' : 'default'}
                      className="rounded-full shadow-lg"
                      onClick={() => handlePlayScene(index)}
                    >
                      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>
                  </div>
                  {/* Playback indicators */}
                  {isPlaying && (
                    <div className="absolute right-2 bottom-2 left-2 flex items-center gap-1.5">
                      {hasMusic && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                          <Music className="h-2.5 w-2.5" />
                          Music
                        </span>
                      )}
                      {scene.audio_status === 'completed' && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                          <Mic className="h-2.5 w-2.5" />
                          Voiceover
                        </span>
                      )}
                    </div>
                  )}
                </>
              ) : scene.video_status === 'processing' ||
                (generatingAsset?.type === 'video' && generatingAsset.index === index) ? (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-gray-400" />
                    <p className="text-xs text-gray-400">Generating video...</p>
                  </div>
                </div>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
                  <Film className="mb-2 h-8 w-8 opacity-50" />
                  <p className="mb-2 text-sm">No video yet</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateAsset('video', index)}
                    disabled={!!generatingAsset}
                  >
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Generate Video
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Info panel */}
          <div className="space-y-4">
            <div>
              <h4 className="mb-1 text-sm font-medium text-gray-500">Narration</h4>
              <p className="text-sm">{scene.script_text}</p>
            </div>

            <div>
              <h4 className="mb-1 text-sm font-medium text-gray-500">Visual Description</h4>
              <p className="text-sm text-gray-600">{scene.visual_prompt}</p>
            </div>

            {/* Voiceover control */}
            <div className="flex items-center gap-2">
              {scene.audio_status === 'completed' ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Voiceover ready
                </span>
              ) : scene.audio_status === 'processing' ||
                (generatingAsset?.type === 'audio' && generatingAsset.index === index) ? (
                <span className="flex items-center gap-1 text-sm text-blue-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Generating voiceover...
                </span>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateAsset('audio', index)}
                  disabled={!!generatingAsset}
                >
                  <Mic className="mr-1 h-3 w-3" />
                  Generate Voiceover
                </Button>
              )}
            </div>

            {/* Combined play button (prominent) */}
            {canPlay && (
              <Button
                variant={isPlaying ? 'secondary' : 'default'}
                onClick={() => handlePlayScene(index)}
              >
                {isPlaying ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Stop Scene
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Play Scene
                    {(hasMusic || scene.audio_status === 'completed') && (
                      <span className="ml-1 text-xs opacity-70">
                        (
                        {[
                          'Video',
                          hasMusic ? 'Music' : '',
                          scene.audio_status === 'completed' ? 'Voice' : '',
                        ]
                          .filter(Boolean)
                          .join(' + ')}
                        )
                      </span>
                    )}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
