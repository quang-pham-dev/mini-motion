import type { Metadata } from 'next';
import { PreviewPage } from '@/features/preview';

export const metadata: Metadata = {
  title: 'Preview Project',
  description: 'Preview and download your AI video',
};

// Server Component: resolves params BEFORE client hydration
// This prevents the PPR %%drp:id%% placeholder from leaking to useParams()
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PreviewPage projectId={id} />;
}
