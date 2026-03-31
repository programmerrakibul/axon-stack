import { connectDB, Product, mapProductToDTO } from "@/shared/db";
import { withErrorHandling, jsonOk } from "@/shared/server/handler";
import { BadRequestError } from "@/shared/server/errors";

/**
 * GET /api/products
 * Fetch all active products with optional category filter
 * Query params: categoryId (optional)
 */
export const GET = withErrorHandling(async (request: Request) => {
  // Initialize database connection (reuses cached connection)
  await connectDB();

  // Get query parameters
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");

  // Build filter query
  const filter: Record<string, unknown> = { isActive: true };
  if (categoryId) {
    filter.categoryId = categoryId;
  }

  // Fetch products
  const products = await Product.find(filter)
    .limit(100) // Pagination: limit results
    .sort({ createdAt: -1 }); // Newest first

  // Map to safe DTOs (excludes sensitive fields, adds computed properties)
  const productDTOs = products.map(mapProductToDTO);

  return jsonOk({
    products: productDTOs,
    count: productDTOs.length,
  });
});

/**
 * POST /api/products
 * Create a new product
 * Body: { name, categoryId, price, stockQty, minThreshold, isActive }
 */
export const POST = withErrorHandling(async (request: Request) => {
  await connectDB();

  const body = await request.json();

  // Validate required fields
  if (
    !body.name ||
    !body.categoryId ||
    body.price === undefined ||
    body.stockQty === undefined
  ) {
    throw new BadRequestError("Missing required fields", {
      required: ["name", "categoryId", "price", "stockQty"],
      provided: Object.keys(body),
    });
  }

  // Create product with defaults
  const product = await Product.create({
    name: body.name,
    categoryId: body.categoryId,
    price: body.price,
    stockQty: body.stockQty,
    minThreshold: body.minThreshold ?? 10,
    isActive: body.isActive ?? true,
  });

  // Return created product as DTO
  return jsonOk(mapProductToDTO(product), { status: 201 });
});
