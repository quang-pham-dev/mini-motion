import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function ProjectCardSkeleton() {
  return (
    <Card className="flex h-48 animate-pulse flex-col border-gray-100">
      <CardHeader className="flex-none pb-3">
        <div className="mb-2 flex items-start justify-between gap-4">
          <div className="h-6 w-3/4 rounded bg-gray-200"></div>
          <div className="h-6 w-20 flex-shrink-0 rounded-full bg-gray-200"></div>
        </div>
        <div className="h-4 w-1/4 rounded bg-gray-200"></div>
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="h-9 w-full rounded bg-gray-200"></div>
      </CardContent>
    </Card>
  );
}

export function SceneCardSkeleton() {
  return (
    <Card className="animate-pulse border-gray-100">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="h-6 w-1/4 rounded bg-gray-200"></div>
          <div className="h-5 w-32 rounded-full bg-gray-200"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="aspect-video rounded-lg bg-gray-200"></div>
          <div className="space-y-4">
            <div>
              <div className="mb-2 h-4 w-20 rounded bg-gray-200"></div>
              <div className="mb-1 h-4 w-full rounded bg-gray-200"></div>
              <div className="h-4 w-5/6 rounded bg-gray-200"></div>
            </div>
            <div>
              <div className="mb-2 h-4 w-32 rounded bg-gray-200"></div>
              <div className="mb-1 h-4 w-full rounded bg-gray-200"></div>
              <div className="h-4 w-4/5 rounded bg-gray-200"></div>
            </div>
            <div className="mt-4 h-5 w-32 rounded bg-gray-200"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PreviewPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-10 flex-none border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex w-1/2 items-center gap-4">
            <div className="h-9 w-20 rounded bg-gray-200"></div>
            <div className="h-7 w-48 rounded bg-gray-200"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-32 rounded bg-gray-200"></div>
          </div>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="space-y-6">
          <Card className="animate-pulse border-gray-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="mb-2 h-6 w-40 rounded bg-gray-200"></div>
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-9 w-32 rounded bg-gray-200"></div>
            </CardContent>
          </Card>

          <div className="h-16 animate-pulse rounded-lg border border-blue-100 bg-blue-50/50"></div>

          <div className="h-7 w-24 rounded bg-gray-200"></div>

          <div className="grid gap-6">
            {[1, 2].map(i => (
              <SceneCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
