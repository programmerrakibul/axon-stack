import { connectDB, Category, mapCategoryToDTO } from "@/shared/db";
import { withErrorHandling, jsonOk } from "@/shared/server/handler";
import { requireSessionUser } from "@/shared/server/require";
import { assertPermission } from "@/shared/server/rbac";
import {
  categoryCreateSchema,
  categoryQuerySchema,
} from "@/modules/categories/schemas";
import { BadRequestError } from "@/shared/server/errors";

/**
 * GET /api/categories
 * List all categories with optional pagination and search
 * Query params: skip (default 0), limit (default 10), search (optional)
 */
export const GET = withErrorHandling(async (request: Request) => {
  await connectDB();

  // Get and validate query parameters
  const { searchParams } = new URL(request.url);
  const queryParams = categoryQuerySchema.parse({
    skip: searchParams.get("skip"),
    limit: searchParams.get("limit"),
    search: searchParams.get("search"),
  });

  // Build filter
  const filter: Record<string, unknown> = {};
  if (queryParams.search) {
    filter.name = { $regex: queryParams.search, $options: "i" };
  }

  // Fetch categories with pagination
  const categories = await Category.find(filter)
    .skip(queryParams.skip)
    .limit(queryParams.limit)
    .sort({ createdAt: -1 });

  // Get total count for pagination
  const total = await Category.countDocuments(filter);

  // Map to DTOs
  const categoryDTOs = categories.map(mapCategoryToDTO);

  return jsonOk({
    categories: categoryDTOs,
    pagination: {
      total,
      skip: queryParams.skip,
      limit: queryParams.limit,
      hasMore: queryParams.skip + queryParams.limit < total,
    },
  });
});

/**
 * POST /api/categories
 * Create a new category (requires catalog:create permission)
 * Body: { name }
 */
export const POST = withErrorHandling(async (request: Request) => {
  await connectDB();

  // Require authenticated user
  const user = await requireSessionUser();

  // Check permission
  assertPermission(user.role, "catalog:create");

  // Parse and validate request body
  const body = await request.json();
  const { name } = categoryCreateSchema.parse(body);

  // Check if category with this name already exists
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    throw new BadRequestError("Category with this name already exists", {
      field: "name",
      value: name,
    });
  }

  // Create category
  const category = await Category.create({ name });

  // Return created category
  return jsonOk(mapCategoryToDTO(category), { status: 201 });
});
