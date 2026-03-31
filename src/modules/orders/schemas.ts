import { z } from "zod";

/**
 * Schema for a single item in an order
 */
export const orderItemSchema = z.object({
  productId: z
    .string()
    .min(1, "Product is required")
    .refine((id) => /^[0-9a-fA-F]{24}$/.test(id), "Invalid product ID"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1"),
});

export type OrderItemInput = z.infer<typeof orderItemSchema>;

/**
 * Schema for creating a new order
 * Includes refinement to ensure no duplicate product IDs in items
 */
export const orderCreateSchema = z.object({
  customerName: z
    .string()
    .min(1, "Customer name is required")
    .min(2, "Customer name must be at least 2 characters")
    .max(200, "Customer name must be no more than 200 characters")
    .trim(),
  items: z
    .array(orderItemSchema)
    .min(1, "Order must have at least one item")
    .max(100, "Order cannot have more than 100 items")
    .refine(
      (items) => {
        const productIds = items.map((item) => item.productId);
        const uniqueIds = new Set(productIds);
        return productIds.length === uniqueIds.size;
      },
      {
        message: "Order cannot contain duplicate products",
        path: ["items"],
      },
    ),
});

export type OrderCreateInput = z.infer<typeof orderCreateSchema>;

/**
 * Schema for updating order status
 */
export const statusUpdateSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ] as const),
});

export type StatusUpdateInput = z.infer<typeof statusUpdateSchema>;

/**
 * Schema for order query parameters
 */
export const orderQuerySchema = z.object({
  skip: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ] as const)
    .optional(),
  search: z.string().trim().optional(),
});

export type OrderQueryParams = z.infer<typeof orderQuerySchema>;

/**
 * Order DTO for API responses (server-side computed)
 */
export const orderDTOSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number(),
      unitPriceSnapshot: z.number(),
      lineTotal: z.number(),
    }),
  ),
  totalPrice: z.number(),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ] as const),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type OrderDTO = z.infer<typeof orderDTOSchema>;
