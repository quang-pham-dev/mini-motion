import { FullscreenMessage } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <FullscreenMessage className="p-4">
      <div className="w-full max-w-md space-y-5 rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <div>
          <h2 className="mb-2 text-4xl font-bold text-gray-900">404</h2>
          <h3 className="mb-2 text-xl font-semibold text-gray-700">Page Not Found</h3>
          <p className="text-sm text-gray-500">Could not find the requested resource or page.</p>
        </div>
        <Link href="/" className="block">
          <Button className="w-full">Return to Dashboard</Button>
        </Link>
      </div>
    </FullscreenMessage>
  );
}
