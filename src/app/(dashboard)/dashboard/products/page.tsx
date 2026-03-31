"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  useListProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/modules/products/api";
import {
  productCreateSchema,
  productUpdateSchema,
  type ProductCreateInput,
  type ProductUpdateInput,
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
import type { ColumnDef } from "@tanstack/react-table";
import type { ProductDTO } from "@/shared/db";

/**
 * Products Management Page
 * Create, list, edit, and delete products
 * Shows stock status and restock indicators
 */
export default function ProductsPage() {
  const [skip, setSkip] = useState(0);
  const limit = 10;
  const [search, setSearch] = useState("");
  const [needsRestockOnly, setNeedsRestockOnly] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Fetch products
  const { data, error } = useListProducts({
    skip,
    limit,
    search,
    needsRestockOnly,
  });

  // Mutations
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(editingProduct?.id || "");
  const deleteMutation = useDeleteProduct();

  // Create form
  const createForm = useForm<ProductCreateInput>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      price: 0,
      stockQty: 0,
      minThreshold: 10,
    },
  });

  // Edit form
  const editForm = useForm<ProductUpdateInput>({
    resolver: zodResolver(productUpdateSchema),
    defaultValues: {
      name: "",
      price: 0,
      stockQty: 0,
      minThreshold: 10,
    },
  });

  // Handle create submit
  const onCreateSubmit = async (formData: ProductCreateInput) => {
    try {
      await createMutation.mutateAsync(formData);
      toast.success("Product created successfully");
      createForm.reset();
      setShowCreateDialog(false);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.isCode("VALIDATION_ERROR") && err.details) {
          const issues = (err.details as any)?.issues || [];
          if (Array.isArray(issues) && issues.length > 0) {
            toast.error(issues[0].message);
          } else {
            toast.error(err.message);
          }
        } else {
          toast.error(err.message || "Failed to create product");
        }
      }
    }
  };

  // Handle edit submit
  const onEditSubmit = async (formData: ProductUpdateInput) => {
    if (!editingProduct) return;

    try {
      await updateMutation.mutateAsync(formData);
      toast.success("Product updated successfully");
      editForm.reset();
      setShowEditDialog(false);
      setEditingProduct(null);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.isCode("VALIDATION_ERROR") && err.details) {
          const issues = (err.details as any)?.issues || [];
          if (Array.isArray(issues) && issues.length > 0) {
            toast.error(issues[0].message);
          } else {
            toast.error(err.message);
          }
        } else {
          toast.error(err.message || "Failed to update product");
        }
      }
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Product deleted successfully");
    } catch (err) {
      if (err instanceof ApiClientError) {
        toast.error(err.message || "Failed to delete product");
      }
    }
  };

  // Handle edit click
  const handleEditClick = (product: ProductDTO) => {
    setEditingProduct(product);
    editForm.reset({
      name: product.name,
      price: product.price,
      stockQty: product.stockQty,
      minThreshold: product.minThreshold,
    });
    setShowEditDialog(true);
  };

  // Table columns
  const columns: ColumnDef<ProductDTO>[] = [
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="font-medium text-sm">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <div className="text-sm">${row.original.price.toFixed(2)}</div>
      ),
    },
    {
      accessorKey: "stockQty",
      header: "Stock",
      cell: ({ row }) => {
        const product = row.original;
        const needsRestock = product.needsRestock;
        return (
          <div
            className={`text-sm font-medium ${
              needsRestock ? "text-red-600" : "text-green-600"
            }`}
          >
            {product.stockQty}
            {needsRestock && " ⚠️"}
          </div>
        );
      },
    },
    {
      accessorKey: "minThreshold",
      header: "Min Threshold",
      cell: ({ row }) => (
        <div className="text-sm">{row.original.minThreshold}</div>
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
            onClick={() => handleEditClick(row.original)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:bg-red-50"
            onClick={() => handleDelete(row.original.id)}
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Products"
        description="Manage inventory products and stock levels"
        action={
          <Button onClick={() => setShowCreateDialog(true)}>
            + New Product
          </Button>
        }
      />

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSkip(0);
            }}
          />
          <Label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={needsRestockOnly}
              onChange={(e) => {
                setNeedsRestockOnly(e.target.checked);
                setSkip(0);
              }}
              className="rounded"
            />
            <span className="text-sm">Needs Restock Only</span>
          </Label>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-sm text-red-800">
            {error instanceof ApiClientError
              ? error.message
              : "Failed to load products"}
          </p>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <DataTable columns={columns} data={data?.products || []} />

        {/* Pagination */}
        {data?.pagination && (
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {skip + 1}-{Math.min(skip + limit, data.pagination.total)}{" "}
              of {data.pagination.total}
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

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={createForm.handleSubmit(onCreateSubmit)}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="create-name">Product Name</Label>
              <Input
                id="create-name"
                placeholder="Product name"
                {...createForm.register("name")}
              />
              {createForm.formState.errors.name && (
                <p className="text-xs text-red-600 mt-1">
                  {createForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="create-categoryId">Category ID</Label>
              <Input
                id="create-categoryId"
                placeholder="MongoDB ObjectId"
                {...createForm.register("categoryId")}
              />
              {createForm.formState.errors.categoryId && (
                <p className="text-xs text-red-600 mt-1">
                  {createForm.formState.errors.categoryId.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="create-price">Price</Label>
              <Input
                id="create-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...createForm.register("price", { valueAsNumber: true })}
              />
              {createForm.formState.errors.price && (
                <p className="text-xs text-red-600 mt-1">
                  {createForm.formState.errors.price.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-stockQty">Stock Quantity</Label>
                <Input
                  id="create-stockQty"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...createForm.register("stockQty", { valueAsNumber: true })}
                />
                {createForm.formState.errors.stockQty && (
                  <p className="text-xs text-red-600 mt-1">
                    {createForm.formState.errors.stockQty.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="create-minThreshold">Min Threshold</Label>
                <Input
                  id="create-minThreshold"
                  type="number"
                  min="0"
                  placeholder="10"
                  {...createForm.register("minThreshold", {
                    valueAsNumber: true,
                  })}
                />
                {createForm.formState.errors.minThreshold && (
                  <p className="text-xs text-red-600 mt-1">
                    {createForm.formState.errors.minThreshold.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create Product"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit(onEditSubmit)}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="edit-name">Product Name</Label>
              <Input
                id="edit-name"
                placeholder="Product name"
                {...editForm.register("name")}
              />
              {editForm.formState.errors.name && (
                <p className="text-xs text-red-600 mt-1">
                  {editForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="edit-price">Price</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...editForm.register("price", { valueAsNumber: true })}
              />
              {editForm.formState.errors.price && (
                <p className="text-xs text-red-600 mt-1">
                  {editForm.formState.errors.price.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-stockQty">Stock Quantity</Label>
                <Input
                  id="edit-stockQty"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...editForm.register("stockQty", { valueAsNumber: true })}
                />
                {editForm.formState.errors.stockQty && (
                  <p className="text-xs text-red-600 mt-1">
                    {editForm.formState.errors.stockQty.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-minThreshold">Min Threshold</Label>
                <Input
                  id="edit-minThreshold"
                  type="number"
                  min="0"
                  placeholder="10"
                  {...editForm.register("minThreshold", {
                    valueAsNumber: true,
                  })}
                />
                {editForm.formState.errors.minThreshold && (
                  <p className="text-xs text-red-600 mt-1">
                    {editForm.formState.errors.minThreshold.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Update Product"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
