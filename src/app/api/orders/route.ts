import { connectDB, Order, mapOrderToDTO } from "@/shared/db";
import { withErrorHandling, jsonOk } from "@/shared/server/handler";
import { requireSessionUser } from "@/shared/server/require";
import { assertPermission } from "@/shared/server/rbac";
import { orderCreateSchema, orderQuerySchema } from "@/modules/orders/schemas";
import { calculateOrderTotals } from "@/shared/server/orders";

/**
 * GET /api/orders
 * List all orders with pagination and status filtering
 *
 * Query params:
 * - skip (default 0)
 * - limit (default 10)
 * - status (optional filter by order status)
 * - search (optional search by customer name)
 */
export const GET = withErrorHandling(async (request: Request) => {
  await connectDB();

  // Parse and validate query parameters
  const { searchParams } = new URL(request.url);
  const queryParams = orderQuerySchema.parse({
    skip: searchParams.get("skip"),
    limit: searchParams.get("limit"),
    status: searchParams.get("status"),
    search: searchParams.get("search"),
  });

  // Build filter
  const filter: Record<string, unknown> = {};

  if (queryParams.search) {
    filter.customerName = { $regex: queryParams.search, $options: "i" };
  }

  if (queryParams.status) {
    filter.status = queryParams.status;
  }

  // Fetch orders with pagination
  const orders = await Order.find(filter)
    .skip(queryParams.skip)
    .limit(queryParams.limit)
    .sort({ createdAt: -1 });

  // Get total count for pagination
  const total = await Order.countDocuments(filter);

  // Map to DTOs
  const orderDTOs = orders.map(mapOrderToDTO);

  return jsonOk({
    orders: orderDTOs,
    pagination: {
      total,
      skip: queryParams.skip,
      limit: queryParams.limit,
      hasMore: queryParams.skip + queryParams.limit < total,
    },
  });
});

/**
 * POST /api/orders
 * Create a new order (requires orders:create permission)
 *
 * Body:
 * {
 *   customerName: string,
 *   items: [
 *     { productId: string, quantity: number }
 *   ]
 * }
 *
 * Returns OrderDTO with PENDING status
 * Note: Does NOT confirm order or deduct stock (use /api/orders/[id]/confirm for that)
 */
export const POST = withErrorHandling(async (request: Request) => {
  await connectDB();

  // Require authenticated user
  const user = await requireSessionUser();

  // Check permission
  assertPermission(user.role, "orders:create");

  // Parse and validate request body
  const body = await request.json();
  const { customerName, items } = orderCreateSchema.parse(body);

  // Calculate totals and check availability (but don't deduct yet)
  const { items: calculatedItems, totalPrice } =
    await calculateOrderTotals(items);

  // Create order with PENDING status
  const order = await Order.create({
    customerName,
    items: calculatedItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPriceSnapshot: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
    totalPrice,
    status: "PENDING",
  });

  return jsonOk(mapOrderToDTO(order), { status: 201 });
});
