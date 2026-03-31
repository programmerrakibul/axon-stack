import { z } from "zod";

/**
 * Schema for creating a new category
 */
export const categoryCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be no more than 100 characters")
    .trim(),
});

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;

/**
 * Schema for updating a category
 */
export const categoryUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be no more than 100 characters")
    .trim(),
});

export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;

/**
 * Schema for category query parameters (pagination, filtering)
 */
export const categoryQuerySchema = z.object({
  skip: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
});

export type CategoryQueryParams = z.infer<typeof categoryQuerySchema>;

/**
 * Category DTO schema for responses
 */
export const categoryDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CategoryDTO = z.infer<typeof categoryDTOSchema>;
