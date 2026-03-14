import { FullscreenMessage } from '@/components/layouts';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <FullscreenMessage>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <p className="text-sm font-medium text-gray-500">Loading...</p>
      </div>
    </FullscreenMessage>
  );
}
