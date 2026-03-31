import { connectDB, mapOrderToDTO } from "@/shared/db";
import { withErrorHandling, jsonOk } from "@/shared/server/handler";
import { requireSessionUser } from "@/shared/server/require";
import { assertPermission } from "@/shared/server/rbac";
import { confirmOrder } from "@/shared/server/orders";

/**
 * POST /api/orders/[id]/confirm
 * Confirm a PENDING order, deducting stock atomically.
 * Requires orders:edit permission.
 *
 * Errors propagated via withErrorHandling:
 *   400 BadRequestError — order not found or not PENDING
 *   409 ConflictError   — insufficient stock
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  return withErrorHandling(async () => {
    await connectDB();

    const user = await requireSessionUser();
    assertPermission(user.role, "orders:edit");

    const order = await confirmOrder(id);

    return jsonOk(mapOrderToDTO(order));
  })(request);
}
