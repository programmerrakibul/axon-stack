"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { OrdersTable } from "@/modules/orders/components/OrdersTable";
import { CreateOrderDialog } from "@/modules/orders/components/CreateOrderDialog";
import { useOrders } from "@/modules/orders/hooks";

export default function OrdersPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data, isPending } = useOrders({ skip: 0, limit: 50 });

  return (
    <Container>
      <PageHeader
        title="Orders"
        description="View and manage customer orders"
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        }
      />

      <div className="mt-8">
        <OrdersTable orders={data?.orders ?? []} isLoading={isPending} />
      </div>

      <CreateOrderDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </Container>
  );
}
