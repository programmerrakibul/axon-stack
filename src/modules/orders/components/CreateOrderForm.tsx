"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { orderCreateSchema, type OrderCreateInput } from "@/modules/orders/schemas";
import { useCreateOrder } from "@/modules/orders/hooks";
import { useListProducts } from "@/modules/products/api";
import { ApiClientError } from "@/shared/client/api";

interface CreateOrderFormProps {
  onSuccess: () => void;
}

export function CreateOrderForm({ onSuccess }: CreateOrderFormProps) {
  const [conflictProductId, setConflictProductId] = useState<string | null>(null);

  const { data: productsData } = useListProducts({ skip: 0, limit: 100 });
  const products = productsData?.products ?? [];

  const createOrderMutation = useCreateOrder();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OrderCreateInput>({
    resolver: zodResolver(orderCreateSchema),
    defaultValues: {
      customerName: "",
      items: [{ productId: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");

  // Track the snapshot of the conflicting item when conflict was set
  const [conflictSnapshot, setConflictSnapshot] = useState<{
    index: number;
    productId: string;
    quantity: number;
  } | null>(null);

  // Clear conflict highlight when the conflicting row changes
  useEffect(() => {
    if (!conflictProductId || !conflictSnapshot) return;
    const current = watchedItems[conflictSnapshot.index];
    if (
      !current ||
      current.productId !== conflictSnapshot.productId ||
      current.quantity !== conflictSnapshot.quantity
    ) {
      setConflictProductId(null);
      setConflictSnapshot(null);
    }
  }, [watchedItems, conflictProductId, conflictSnapshot]);

  const onSubmit = (data: OrderCreateInput) => {
    createOrderMutation.mutate(data, {
      onSuccess: () => {
        onSuccess();
      },
      onError: (err) => {
        if (err instanceof ApiClientError && err.isCode("CONFLICT")) {
          toast.error(err.message);
          const details = err.details as { productId?: string } | undefined;
          const pid = details?.productId ?? null;
          setConflictProductId(pid);
          if (pid) {
            const idx = watchedItems.findIndex((item) => item.productId === pid);
            if (idx !== -1) {
              setConflictSnapshot({
                index: idx,
                productId: watchedItems[idx].productId,
                quantity: watchedItems[idx].quantity,
              });
            }
          }
        } else {
          toast.error("Failed to create order");
        }
      },
    });
  };

  const isPending = createOrderMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Customer Name */}
      <div className="space-y-1">
        <Label htmlFor="customerName">Customer Name</Label>
        <Input
          id="customerName"
          placeholder="Enter customer name"
          {...register("customerName")}
        />
        {errors.customerName && (
          <p className="text-sm text-destructive">{errors.customerName.message}</p>
        )}
      </div>

      {/* Items */}
      <div className="space-y-2">
        <Label>Order Items</Label>

        {fields.map((field, index) => {
          const isConflict = watchedItems[index]?.productId === conflictProductId && conflictProductId !== null;
          return (
            <div
              key={field.id}
              className={cn(
                "flex items-start gap-2 rounded-md p-2",
                isConflict ? "border border-destructive" : "border border-transparent",
              )}
            >
              {/* Product selector */}
              <div className="flex-1 space-y-1">
                <Controller
                  control={control}
                  name={`items.${index}.productId`}
                  render={({ field: controllerField }) => (
                    <Select
                      value={controllerField.value}
                      onValueChange={(val) => {
                        controllerField.onChange(val);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.items?.[index]?.productId && (
                  <p className="text-sm text-destructive">
                    {errors.items[index]?.productId?.message}
                  </p>
                )}
              </div>

              {/* Quantity input */}
              <div className="w-24 space-y-1">
                <Input
                  type="number"
                  min={1}
                  placeholder="Qty"
                  {...register(`items.${index}.quantity`, {
                    valueAsNumber: true,
                  })}
                />
                {errors.items?.[index]?.quantity && (
                  <p className="text-sm text-destructive">
                    {errors.items[index]?.quantity?.message}
                  </p>
                )}
              </div>

              {/* Remove button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={fields.length === 1}
                onClick={() => remove(index)}
                aria-label="Remove item"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}

        {/* Items-level error (e.g. duplicate products) */}
        {errors.items && !Array.isArray(errors.items) && (
          <p className="text-sm text-destructive">{(errors.items as { message?: string }).message}</p>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ productId: "", quantity: 1 })}
          className="mt-1"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Submit */}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? "Creating..." : "Create Order"}
      </Button>
    </form>
  );
}
