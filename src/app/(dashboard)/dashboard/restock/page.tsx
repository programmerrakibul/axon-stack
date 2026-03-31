"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  useListRestockItems,
  useUpdateRestockPriority,
  useRemoveFromRestockQueue,
} from "@/modules/products/api";
import {
  restockUpdateSchema,
  type RestockUpdateInput,
} from "@/modules/products/schemas";
import { ApiClientError } from "@/shared/client/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { RotateCw } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

interface RestockItemRow {
  id: string;
  productId: string;
  productName: string;
  priority: number;
  stockQty: number;
  minThreshold: number;
  stockPercentage: number;
  price: number;
}

/**
 * Restock Queue Management Page
 * View products that need restocking, sorted by priority
 * Adjust priorities and mark items as completed
 */
export default function RestockPage() {
  const [skip, setSkip] = useState(0);
  const limit = 10;
  const [sortBy, setSortBy] = useState<"priority" | "stockLevel" | "createdAt">(
    "priority",
  );
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [editingItem, setEditingItem] = useState<RestockItemRow | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Fetch restock items
  const { data, error } = useListRestockItems({
    skip,
    limit,
    sortBy,
    order,
  });

  // Mutations
  const updatePriorityMutation = useUpdateRestockPriority(
    editingItem?.productId || "",
  );
  const removeFromQueueMutation = useRemoveFromRestockQueue();

  // Edit form
  const editForm = useForm<RestockUpdateInput>({
    resolver: zodResolver(restockUpdateSchema),
    defaultValues: {
      priority: 50,
    },
  });

  // Handle priority update submit
  const onUpdatePrioritySubmit = async (formData: RestockUpdateInput) => {
    if (!editingItem) return;

    try {
      await updatePriorityMutation.mutateAsync(formData);
      toast.success("Priority updated successfully");
      editForm.reset();
      setShowEditDialog(false);
      setEditingItem(null);
    } catch (err) {
      if (err instanceof ApiClientError) {
        toast.error(err.message || "Failed to update priority");
      }
    }
  };

  // Handle remove from queue
  const handleRemoveFromQueue = async (
    productId: string,
    productName: string,
  ) => {
    if (
      !confirm(
        `Remove "${productName}" from restock queue? This marks it as completed.`,
      )
    ) {
      return;
    }

    try {
      await removeFromQueueMutation.mutateAsync(productId);
      toast.success("Removed from restock queue");
    } catch (err) {
      if (err instanceof ApiClientError) {
        toast.error(err.message || "Failed to remove from queue");
      }
    }
  };

  // Handle edit click
  const handleEditPriority = (item: RestockItemRow) => {
    setEditingItem(item);
    editForm.reset({
      priority: item.priority,
    });
    setShowEditDialog(true);
  };

  // Priority color getter
  const getPriorityColor = (priority: number) => {
    if (priority >= 75) return "bg-red-100 text-red-800";
    if (priority >= 50) return "bg-orange-100 text-orange-800";
    return "bg-yellow-100 text-yellow-800";
  };

  // Stock percentage color getter
  const getStockPercentageColor = (percentage: number) => {
    if (percentage <= 25) return "text-red-600";
    if (percentage <= 50) return "text-orange-600";
    return "text-green-600";
  };

  // Table columns
  const columns: ColumnDef<RestockItemRow>[] = [
    {
      accessorKey: "productName",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="font-medium text-sm">{row.original.productName}</div>
      ),
    },
    {
      accessorKey: "stockQty",
      header: "Current Stock",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.stockQty} / {row.original.minThreshold}
        </div>
      ),
    },
    {
      accessorKey: "stockPercentage",
      header: "Stock Level",
      cell: ({ row }) => (
        <div
          className={`text-sm font-medium ${getStockPercentageColor(
            row.original.stockPercentage,
          )}`}
        >
          {row.original.stockPercentage}%
        </div>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => (
        <div
          className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
            row.original.priority,
          )}`}
        >
          {row.original.priority}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "Unit Price",
      cell: ({ row }) => (
        <div className="text-sm">${row.original.price.toFixed(2)}</div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditPriority(row.original)}
          >
            Edit Priority
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-green-600 hover:bg-green-50"
            onClick={() =>
              handleRemoveFromQueue(
                row.original.productId,
                row.original.productName,
              )
            }
            disabled={removeFromQueueMutation.isPending}
          >
            Done
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Restock Queue"
        description="Products that need restocking, sorted by priority"
        action={
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(
                  e.target.value as "priority" | "stockLevel" | "createdAt",
                );
                setSkip(0);
              }}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="priority">Sort by Priority</option>
              <option value="stockLevel">Sort by Stock Level</option>
              <option value="createdAt">Sort by Added Date</option>
            </select>
            <button
              onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
              className="px-3 py-2 border rounded-md text-sm hover:bg-gray-50"
            >
              {order === "asc" ? "↑" : "↓"}
            </button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total in Queue</div>
          <div className="text-2xl font-bold mt-1">
            {data?.pagination.total || 0}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Critical (Priority 75+)</div>
          <div className="text-2xl font-bold mt-1">
            {data?.restockItems.filter((item) => item.priority >= 75).length ||
              0}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Low (Priority 50+)</div>
          <div className="text-2xl font-bold mt-1">
            {data?.restockItems.filter(
              (item) => item.priority >= 50 && item.priority < 75,
            ).length || 0}
          </div>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-sm text-red-800">
            {error instanceof ApiClientError
              ? error.message
              : "Failed to load restock items"}
          </p>
        </Card>
      )}

      {/* Restock Table */}
      {data?.restockItems && data.restockItems.length > 0 ? (
        <Card>
          <DataTable columns={columns} data={data.restockItems} />

          {/* Pagination */}
          {data.pagination && (
            <div className="p-4 border-t flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {skip + 1}-
                {Math.min(skip + limit, data.pagination.total)} of{" "}
                {data.pagination.total}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={skip === 0}
                  onClick={() => setSkip(Math.max(0, skip - limit))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.pagination.hasMore}
                  onClick={() => setSkip(skip + limit)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <EmptyState
          icon={<RotateCw className="h-12 w-12" />}
          title="No restock needed"
          description="All products are stocked above their minimum thresholds"
        />
      )}

      {/* Edit Priority Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Update Priority - {editingItem?.productName}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit(onUpdatePrioritySubmit)}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="priority">Priority (1-100)</Label>
              <div className="text-xs text-gray-500 mb-2">
                Higher number = Higher priority. 75+ = Critical, 50-74 = High,
                &lt;50 = Normal
              </div>
              <Input
                id="priority"
                type="number"
                min="1"
                max="100"
                placeholder="50"
                {...editForm.register("priority", { valueAsNumber: true })}
              />
              {editForm.formState.errors.priority && (
                <p className="text-xs text-red-600 mt-1">
                  {editForm.formState.errors.priority.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-xs text-gray-600">
                <strong>Current Stock:</strong> {editingItem?.stockQty} /{" "}
                {editingItem?.minThreshold} ({editingItem?.stockPercentage}%)
              </div>
              <div className="text-xs text-gray-600">
                <strong>Unit Price:</strong> ${editingItem?.price.toFixed(2)}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={updatePriorityMutation.isPending}
            >
              {updatePriorityMutation.isPending
                ? "Updating..."
                : "Update Priority"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
