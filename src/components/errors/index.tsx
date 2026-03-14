import { FullscreenMessage } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
}

export function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  return (
    <FullscreenMessage className="p-4">
      <div className="w-full max-w-md space-y-5 rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Something went wrong!</h2>
          <p className="text-sm break-words text-gray-500">
            {error.message || 'An unexpected error occurred.'}
          </p>
        </div>
        <Button onClick={() => reset()} className="w-full">
          Try again
        </Button>
      </div>
    </FullscreenMessage>
  );
}
