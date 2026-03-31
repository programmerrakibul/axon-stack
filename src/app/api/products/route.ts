import { connectDB, Product, mapProductToDTO } from "@/shared/db";
import { withErrorHandling, jsonOk } from "@/shared/server/handler";
import { requireSessionUser } from "@/shared/server/require";
import { assertPermission } from "@/shared/server/rbac";
import {
  productCreateSchema,
  productQuerySchema,
} from "@/modules/products/schemas";
import { BadRequestError } from "@/shared/server/errors";
import { syncRestockForProduct } from "@/shared/server/stock";

/**
 * GET /api/products
 * List all products with pagination, search, filtering, and restock status
 *
 * Query params:
 * - skip (default 0)
 * - limit (default 10)
 * - search (optional text search on name)
 * - categoryId (optional filter by category)
 * - isActive (optional filter by active status)
 * - needsRestockOnly (optional filter to only show products below threshold)
 */
export const GET = withErrorHandling(async (request: Request) => {
  await connectDB();

  // Parse and validate query parameters
  const { searchParams } = new URL(request.url);
  const queryParams = productQuerySchema.parse({
    skip: searchParams.get("skip"),
    limit: searchParams.get("limit"),
    search: searchParams.get("search"),
    categoryId: searchParams.get("categoryId"),
    isActive: searchParams.get("isActive"),
    needsRestockOnly: searchParams.get("needsRestockOnly"),
  });

  // Build filter
  const filter: Record<string, unknown> = {};

  if (queryParams.search) {
    filter.name = { $regex: queryParams.search, $options: "i" };
  }

  if (queryParams.categoryId) {
    filter.categoryId = queryParams.categoryId;
  }

  if (queryParams.isActive !== undefined) {
    filter.isActive = queryParams.isActive;
  }

  if (queryParams.needsRestockOnly) {
    filter.$expr = {
      $lte: ["$stockQty", "$minThreshold"],
    };
  }

  // Fetch products with pagination
  const products = await Product.find(filter)
    .skip(queryParams.skip)
    .limit(queryParams.limit)
    .sort({ createdAt: -1 });

  // Get total count for pagination
  const total = await Product.countDocuments(filter);

  // Map to DTOs
  const productDTOs = products.map(mapProductToDTO);

  return jsonOk({
    products: productDTOs,
    pagination: {
      total,
      skip: queryParams.skip,
      limit: queryParams.limit,
      hasMore: queryParams.skip + queryParams.limit < total,
    },
  });
});

/**
 * POST /api/products
 * Create a new product (requires catalog:create permission)
 *
 * Body:
 * {
 *   name: string,
 *   categoryId: string (MongoDB ObjectId),
 *   price: number,
 *   stockQty: number,
 *   minThreshold: number
 * }
 */
export const POST = withErrorHandling(async (request: Request) => {
  await connectDB();

  // Require authenticated user
  const user = await requireSessionUser();

  // Check permission
  assertPermission(user.role, "catalog:create");

  // Parse and validate request body
  const body = await request.json();
  const { name, categoryId, price, stockQty, minThreshold } =
    productCreateSchema.parse(body);

  // Check if product with this name already exists
  const existingProduct = await Product.findOne({ name });
  if (existingProduct) {
    throw new BadRequestError("Product with this name already exists", {
      field: "name",
      value: name,
    });
  }

  // Create product
  const product = await Product.create({
    name,
    categoryId,
    price,
    stockQty,
    minThreshold,
    isActive: true,
  });

  // Sync restock status if product needs restocking
  await syncRestockForProduct(product);

  // Return created product
  return jsonOk(mapProductToDTO(product), { status: 201 });
});
