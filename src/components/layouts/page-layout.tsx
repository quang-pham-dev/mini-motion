import { cn } from '@/lib/utils';
import * as React from 'react';

export function PageLayout({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('min-h-screen bg-gray-50', className)} {...props}>
      {children}
    </div>
  );
}

export function MainContainer({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <main className={cn('container mx-auto px-4 py-8', className)} {...props}>
      {children}
    </main>
  );
}
