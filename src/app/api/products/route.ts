import { connectDB, Product, mapProductToDTO } from "@/shared/db";

/**
 * GET /api/products
 * Fetch all active products with optional category filter
 * Query params: categoryId (optional)
 */
export async function GET(request: Request) {
  try {
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

    return Response.json({
      success: true,
      data: productDTOs,
      count: productDTOs.length,
    });
  } catch (error) {
    console.error("❌ GET /api/products error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/products
 * Create a new product
 * Body: { name, categoryId, price, stockQty, minThreshold, isActive }
 */
export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate required fields
    if (
      !body.name ||
      !body.categoryId ||
      body.price === undefined ||
      body.stockQty === undefined
    ) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
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
    return Response.json(
      {
        success: true,
        data: mapProductToDTO(product),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("❌ POST /api/products error:", error);
    return Response.json(
      { success: false, error: "Failed to create product" },
      { status: 500 },
    );
  }
}
