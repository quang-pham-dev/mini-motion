import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/types';
import { CheckCircle, Loader2, Music, Play, RefreshCw } from 'lucide-react';

interface MusicCardProps {
  project: Project;
  hasMusic: boolean;
  generatingAsset: { type: string; index: number } | null;
  handleToggleMusicOnly: () => void;
  handleGenerateAsset: (type: 'music', index: number) => void;
}

export function MusicCard({
  project,
  hasMusic,
  generatingAsset,
  handleToggleMusicOnly,
  handleGenerateAsset,
}: MusicCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Background Music
            </CardTitle>
            <CardDescription>{project.music_vibe}</CardDescription>
          </div>
          {hasMusic && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
              <CheckCircle className="h-3 w-3" />
              Ready
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {hasMusic ? (
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleToggleMusicOnly}>
              <Play className="mr-1 h-3 w-3" />
              Preview Music
            </Button>
            <p className="text-sm text-gray-500">
              Music will auto-play at lower volume when you play a scene
            </p>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => handleGenerateAsset('music', 0)}
            disabled={!!generatingAsset}
          >
            {generatingAsset?.type === 'music' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Music...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate Music
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
