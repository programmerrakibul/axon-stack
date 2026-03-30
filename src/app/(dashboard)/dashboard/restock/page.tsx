import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

export default function RestockPage() {
  return (
    <Container>
      <PageHeader
        title="Restock"
        description="Manage product inventory and restock requests"
        action={<Button>New Restock Order</Button>}
      />

      <div className="mt-8">
        <EmptyState
          icon={<RotateCw className="h-12 w-12" />}
          title="No restock orders"
          description="All products are well stocked."
          action={<Button variant="outline">View Inventory</Button>}
        />
      </div>
    </Container>
  );
}
