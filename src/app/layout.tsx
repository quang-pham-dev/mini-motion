import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/features/auth';
import { Providers } from './providers';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: {
    default: 'Mini Motion',
    template: '%s | Mini Motion',
  },
  description: 'AI Video Content Automation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn('antialiased', geistSans.variable, geistMono.variable)}>
        <AuthProvider>
          <Providers>{children}</Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
