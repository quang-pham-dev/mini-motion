'use client';

import { useEffect } from 'react';
import { ErrorFallback } from '@/components/errors';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return <ErrorFallback error={error} reset={reset} />;
}
