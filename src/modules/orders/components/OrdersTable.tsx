"use client";

import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { DataTable } from "@/components/ui/data-table";
import { SkeletonTable } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { type OrderDTO } from "@/modules/orders/schemas";
import { useConfirmOrder, useUpdateOrderStatus } from "@/modules/orders/hooks";

// Status badge color tokens per status
const statusStyles: Record<OrderDTO["status"], string> = {
  PENDING: "text-yellow-600 bg-yellow-50",
  CONFIRMED: "text-blue-600 bg-blue-50",
  SHIPPED: "text-purple-600 bg-purple-50",
  DELIVERED: "text-green-600 bg-green-50",
  CANCELLED: "text-muted-foreground bg-muted",
};

function StatusBadge({ status }: { status: OrderDTO["status"] }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ActionsCell({ order }: { order: OrderDTO }) {
  const confirmMutation = useConfirmOrder();
  const updateStatusMutation = useUpdateOrderStatus();

  const canConfirm = order.status === "PENDING";
  const canCancel =
    order.status === "PENDING" ||
    order.status === "CONFIRMED" ||
    order.status === "SHIPPED";

  if (!canConfirm && !canCancel) return null;

  return (
    <div className="flex items-center gap-2">
      {canConfirm && (
        <Button
          size="sm"
          variant="outline"
          disabled={confirmMutation.isPending}
          onClick={() =>
            confirmMutation.mutate(order.id, {
              onError: (err) => toast.error(err.message ?? "Failed to confirm order"),
            })
          }
        >
          {confirmMutation.isPending && (
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          )}
          Confirm
        </Button>
      )}
      {canCancel && (
        <Button
          size="sm"
          variant="destructive"
          disabled={updateStatusMutation.isPending}
          onClick={() =>
            updateStatusMutation.mutate(
              { id: order.id, status: "CANCELLED" },
              {
                onError: (err) =>
                  toast.error(err.message ?? "Failed to cancel order"),
              },
            )
          }
        >
          {updateStatusMutation.isPending && (
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          )}
          Cancel
        </Button>
      )}
    </div>
  );
}

const columns: ColumnDef<OrderDTO>[] = [
  {
    accessorKey: "customerName",
    header: "Customer",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "totalPrice",
    header: "Total",
    cell: ({ row }) => formatCurrency(row.original.totalPrice),
  },
  {
    id: "itemCount",
    header: "Items",
    cell: ({ row }) => row.original.items.length,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ActionsCell order={row.original} />,
  },
];

interface OrdersTableProps {
  orders: OrderDTO[];
  isLoading: boolean;
}

export function OrdersTable({ orders, isLoading }: OrdersTableProps) {
  if (isLoading) {
    return <SkeletonTable />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="Orders will appear here once customers start placing them."
      />
    );
  }

  return <DataTable columns={columns} data={orders} searchKey="customerName" />;
}
