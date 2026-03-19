"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64 bg-muted" />
        <Skeleton className="h-5 w-80 bg-muted" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-48 rounded-xl bg-muted" />
        <Skeleton className="h-48 rounded-xl bg-muted" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-36 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
