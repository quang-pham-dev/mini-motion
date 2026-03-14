import { Button } from '@/components/ui/button';
import { ScriptOutput } from '@/types';
import { ArrowLeft, Play } from 'lucide-react';
import Link from 'next/link';

interface EditorHeaderProps {
  script: ScriptOutput | null;
  onSaveAndGenerate: () => void;
}

export function EditorHeader({ script, onSaveAndGenerate }: EditorHeaderProps) {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Script Editor</h1>
        </div>
        {script && (
          <Button onClick={onSaveAndGenerate}>
            <Play className="mr-2 h-4 w-4" />
            Generate Assets
          </Button>
        )}
      </div>
    </header>
  );
}
