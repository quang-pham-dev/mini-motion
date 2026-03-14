import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Music, VolumeX, Volume2, Pause, Loader2, Download } from 'lucide-react';

interface PreviewHeaderProps {
  projectTitle: string;
  hasMusic: boolean;
  playingScene: number | null;
  isMusicMuted: boolean;
  isDownloading: boolean;
  handleToggleMusicOnly: () => void;
  handleToggleMusicMute: () => void;
  stopAllPlayback: () => void;
  handleDownloadAll: () => void;
}

export function PreviewHeader({
  projectTitle,
  hasMusic,
  playingScene,
  isMusicMuted,
  isDownloading,
  handleToggleMusicOnly,
  handleToggleMusicMute,
  stopAllPlayback,
  handleDownloadAll,
}: PreviewHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-white">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">{projectTitle}</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Music controls */}
          {hasMusic && (
            <>
              <Button variant="outline" size="sm" onClick={handleToggleMusicOnly}>
                <Music
                  className={`mr-2 h-4 w-4 ${playingScene !== null ? 'text-green-500' : ''}`}
                />
                Music
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleMusicMute}
                title={isMusicMuted ? 'Unmute music' : 'Mute music'}
              >
                {isMusicMuted ? (
                  <VolumeX className="h-4 w-4 text-gray-400" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </>
          )}
          {playingScene !== null && (
            <Button variant="destructive" size="sm" onClick={stopAllPlayback}>
              <Pause className="mr-2 h-4 w-4" />
              Stop All
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleDownloadAll} disabled={isDownloading}>
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download All
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
