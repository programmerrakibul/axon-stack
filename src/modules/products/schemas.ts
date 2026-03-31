import { z } from "zod";

/**
 * Schema for creating a new product
 * Validates name, category, price, stock quantity, and minimum threshold
 */
export const productCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name must be no more than 200 characters")
    .trim(),
  categoryId: z
    .string()
    .min(1, "Category is required")
    .refine((id) => /^[0-9a-fA-F]{24}$/.test(id), "Invalid category ID"),
  price: z
    .number()
    .positive("Price must be a positive number")
    .finite("Price must be a valid number")
    .refine(
      (p) => p % 0.01 === 0 || Math.abs(p * 100 - Math.round(p * 100)) < 0.01,
      "Price must have at most 2 decimal places",
    ),
  stockQty: z
    .number()
    .int("Stock quantity must be a whole number")
    .min(0, "Stock quantity cannot be negative"),
  minThreshold: z
    .number()
    .int("Minimum threshold must be a whole number")
    .min(0, "Minimum threshold cannot be negative"),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;

/**
 * Schema for updating a product
 * All fields are optional for partial updates
 */
export const productUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name must be no more than 200 characters")
    .trim()
    .optional(),
  categoryId: z
    .string()
    .refine((id) => /^[0-9a-fA-F]{24}$/.test(id), "Invalid category ID")
    .optional(),
  price: z
    .number()
    .positive("Price must be a positive number")
    .finite("Price must be a valid number")
    .refine(
      (p) => p % 0.01 === 0 || Math.abs(p * 100 - Math.round(p * 100)) < 0.01,
      "Price must have at most 2 decimal places",
    )
    .optional(),
  stockQty: z
    .number()
    .int("Stock quantity must be a whole number")
    .min(0, "Stock quantity cannot be negative")
    .optional(),
  minThreshold: z
    .number()
    .int("Minimum threshold must be a whole number")
    .min(0, "Minimum threshold cannot be negative")
    .optional(),
  isActive: z.boolean().optional(),
});

export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

/**
 * Schema for updating restock item priority
 */
export const restockUpdateSchema = z.object({
  priority: z
    .number()
    .int("Priority must be a whole number")
    .min(1, "Priority must be at least 1")
    .max(100, "Priority must be no more than 100"),
});

export type RestockUpdateInput = z.infer<typeof restockUpdateSchema>;

/**
 * Schema for product query parameters (pagination, filtering)
 */
export const productQuerySchema = z.object({
  skip: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  categoryId: z.string().optional(),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined))
    .pipe(z.boolean().optional()),
  needsRestockOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined))
    .pipe(z.boolean().optional()),
});

export type ProductQueryParams = z.infer<typeof productQuerySchema>;

/**
 * Schema for restock queue query parameters
 */
export const restockQuerySchema = z.object({
  skip: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["priority", "stockLevel", "createdAt"]).default("priority"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type RestockQueryParams = z.infer<typeof restockQuerySchema>;
