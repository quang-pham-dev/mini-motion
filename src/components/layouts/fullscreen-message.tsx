import { cn } from '@/lib/utils';
import * as React from 'react';

export function FullscreenMessage({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex min-h-screen items-center justify-center bg-gray-50', className)}
      {...props}
    >
      {children}
    </div>
  );
}
