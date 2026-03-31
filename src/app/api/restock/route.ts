import { connectDB, RestockItem, mapRestockItemToDTO } from "@/shared/db";
import { withErrorHandling, jsonOk } from "@/shared/server/handler";
import { restockQuerySchema } from "@/modules/products/schemas";

/**
 * GET /api/restock
 * List all products in the restock queue with sorting and pagination
 *
 * Query params:
 * - skip (default 0)
 * - limit (default 10)
 * - sortBy (priority | stockLevel | createdAt, default priority)
 * - order (asc | desc, default desc)
 */
export const GET = withErrorHandling(async (request: Request) => {
  await connectDB();

  // Parse and validate query parameters
  const { searchParams } = new URL(request.url);
  const queryParams = restockQuerySchema.parse({
    skip: searchParams.get("skip"),
    limit: searchParams.get("limit"),
    sortBy: searchParams.get("sortBy"),
    order: searchParams.get("order"),
  });

  // Build sort object
  const sort: Record<string, 1 | -1> = {};
  const sortDirection = queryParams.order === "asc" ? 1 : -1;

  if (queryParams.sortBy === "priority") {
    sort.priority = sortDirection;
  } else if (queryParams.sortBy === "stockLevel") {
    // For stock level sorting, we need to use $expr in aggregation
    // For now, default to priority
    sort.priority = sortDirection;
  } else if (queryParams.sortBy === "createdAt") {
    sort.createdAt = sortDirection;
  } else {
    sort.priority = sortDirection;
  }

  // Fetch restock items with pagination
  const restockItems = await RestockItem.find()
    .skip(queryParams.skip)
    .limit(queryParams.limit)
    .sort(sort)
    .populate({
      path: "productId",
      model: "Product",
      select: "name stockQty minThreshold price",
    });

  // Get total count
  const total = await RestockItem.countDocuments();

  // Map to DTOs and enrich with product info
  const items = restockItems.map((item) => {
    const dto = mapRestockItemToDTO(item);
    const product = item.productId as any;
    return {
      ...dto,
      productName: product?.name || "Unknown",
      stockQty: product?.stockQty || 0,
      minThreshold: product?.minThreshold || 0,
      price: product?.price || 0,
      stockPercentage: product?.minThreshold
        ? Math.round((product.stockQty / product.minThreshold) * 100)
        : 0,
    };
  });

  return jsonOk({
    restockItems: items,
    pagination: {
      total,
      skip: queryParams.skip,
      limit: queryParams.limit,
      hasMore: queryParams.skip + queryParams.limit < total,
    },
  });
});
