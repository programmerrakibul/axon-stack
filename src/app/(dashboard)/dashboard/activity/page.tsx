"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/shared/client/api";
import type { ActivityDTO } from "@/app/api/activity/route";

function ActivityFeed({ entries }: { entries: ActivityDTO[] }) {
  return (
    <div className="mt-8 space-y-2">
      {entries.map((entry) => (
        <div
          key={entry._id}
          className="flex flex-col gap-1 rounded-md border border-border bg-card p-3"
        >
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground">
            {entry.type}
          </span>
          <p className="text-sm text-foreground">{entry.message}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(entry.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function ActivityPage() {
  const { data, isPending } = useQuery<ActivityDTO[]>({
    queryKey: ["activity"],
    queryFn: () => apiFetch("/api/activity"),
  });

  return (
    <Container>
      <PageHeader
        title="Activity"
        description="View system activity and logs"
      />

      {isPending && (
        <div className="mt-8 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {!isPending && data?.length === 0 && (
        <div className="mt-8">
          <EmptyState
            icon={<Activity className="h-12 w-12" />}
            title="No activity yet"
            description="System activity logs will appear here."
          />
        </div>
      )}

      {!isPending && data && data.length > 0 && (
        <ActivityFeed entries={data} />
      )}
    </Container>
  );
}
