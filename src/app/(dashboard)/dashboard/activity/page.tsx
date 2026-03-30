import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";

export default function ActivityPage() {
  return (
    <Container>
      <PageHeader
        title="Activity"
        description="View system activity and logs"
      />

      <div className="mt-8">
        <EmptyState
          icon={<Activity className="h-12 w-12" />}
          title="No activity yet"
          description="System activity logs will appear here."
          action={<Button variant="outline">Refresh</Button>}
        />
      </div>
    </Container>
  );
}
