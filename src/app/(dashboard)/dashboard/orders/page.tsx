import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export default function OrdersPage() {
  return (
    <Container>
      <PageHeader
        title="Orders"
        description="View and manage customer orders"
        action={<Button>New Order</Button>}
      />

      <div className="mt-8">
        <EmptyState
          icon={<ShoppingCart className="h-12 w-12" />}
          title="No orders found"
          description="Orders will appear here once customers start ordering."
          action={<Button variant="outline">View All</Button>}
        />
      </div>
    </Container>
  );
}
