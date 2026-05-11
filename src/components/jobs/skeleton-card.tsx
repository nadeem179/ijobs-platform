export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border/40 bg-background p-5">
      <div className="flex items-start gap-4">
        {/* Logo skeleton */}
        <div className="h-12 w-12 shrink-0 rounded-xl bg-muted animate-pulse" />

        <div className="flex-1 min-w-0 space-y-3">
          {/* Title + save */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1">
              <div className="h-5 w-3/5 rounded-md bg-muted animate-pulse" />
              <div className="h-4 w-2/5 rounded-md bg-muted animate-pulse" />
            </div>
            <div className="h-8 w-8 shrink-0 rounded-md bg-muted animate-pulse" />
          </div>

          {/* Meta row */}
          <div className="flex gap-3">
            <div className="h-3 w-24 rounded-md bg-muted animate-pulse" />
            <div className="h-3 w-20 rounded-md bg-muted animate-pulse" />
            <div className="h-3 w-16 rounded-md bg-muted animate-pulse" />
          </div>

          {/* Salary */}
          <div className="h-4 w-28 rounded-md bg-muted animate-pulse" />

          {/* Description */}
          <div className="space-y-1.5">
            <div className="h-3 w-full rounded-md bg-muted animate-pulse" />
            <div className="h-3 w-4/5 rounded-md bg-muted animate-pulse" />
          </div>

          {/* Skills */}
          <div className="flex gap-2">
            <div className="h-6 w-16 rounded-md bg-muted animate-pulse" />
            <div className="h-6 w-20 rounded-md bg-muted animate-pulse" />
            <div className="h-6 w-14 rounded-md bg-muted animate-pulse" />
          </div>

          {/* Trust signals */}
          <div className="h-3 w-32 rounded-md bg-muted animate-pulse" />

          {/* CTA */}
          <div className="flex gap-2">
            <div className="h-8 w-24 rounded-lg bg-muted animate-pulse" />
            <div className="h-8 w-24 rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}