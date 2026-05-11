export function SkeletonDetail() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Main content skeleton */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Hero */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 shrink-0 rounded-2xl bg-muted animate-pulse" />
                <div className="flex-1 space-y-3">
                  <div className="h-8 w-3/4 rounded-lg bg-muted animate-pulse" />
                  <div className="h-5 w-1/3 rounded-lg bg-muted animate-pulse" />
                  <div className="flex gap-3">
                    <div className="h-4 w-32 rounded-md bg-muted animate-pulse" />
                    <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
                    <div className="h-4 w-20 rounded-md bg-muted animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Sections */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 w-48 rounded-lg bg-muted animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-full rounded-md bg-muted animate-pulse" />
                  <div className="h-4 w-5/6 rounded-md bg-muted animate-pulse" />
                  <div className="h-4 w-4/6 rounded-md bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar skeleton */}
          <div className="hidden lg:block w-80 shrink-0 space-y-4">
            <div className="h-[400px] rounded-2xl bg-muted animate-pulse" />
            <div className="h-[200px] rounded-2xl bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}