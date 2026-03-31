import { connectDB, mapOrderToDTO, Order, OrderStatus } from "@/shared/db";
import { withErrorHandling, jsonOk } from "@/shared/server/handler";
import { requireSessionUser } from "@/shared/server/require";
import { assertPermission } from "@/shared/server/rbac";
import {
  assertValidStatusTransition,
  restoreStockForCancelledOrder,
} from "@/shared/server/orders";
import { NotFoundError } from "@/shared/server/errors";
import { statusUpdateSchema } from "@/modules/orders/schemas";
import { validateBody, validateParams } from "@/shared/server/validate";
import { z } from "zod";

const idParamsSchema = z.object({ id: z.string().min(1) });

/**
 * PATCH /api/orders/[id]/status
 * Update the status of an order, enforcing valid transitions.
 * Restores stock when cancelling from CONFIRMED or SHIPPED.
 * Requires orders:edit permission.
 *
 * Errors propagated via withErrorHandling:
 *   400 BadRequestError — invalid transition
 *   404 NotFoundError   — order not found
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = validateParams(await params, idParamsSchema);
  return withErrorHandling(async () => {
    await connectDB();

    const user = await requireSessionUser();
    assertPermission(user.role, "orders:edit");

    const { status: newStatus } = await validateBody(request, statusUpdateSchema);

    const order = await Order.findById(id);
    if (!order) {
      throw new NotFoundError("Order");
    }

    assertValidStatusTransition(
      order.status as OrderStatus,
      newStatus as OrderStatus,
    );

    const stockRestorationStatuses: OrderStatus[] = [
      OrderStatus.CONFIRMED,
      OrderStatus.SHIPPED,
    ];

    if (
      newStatus === OrderStatus.CANCELLED &&
      stockRestorationStatuses.includes(order.status as OrderStatus)
    ) {
      await restoreStockForCancelledOrder(id);
    }

    order.status = newStatus as OrderStatus;
    await order.save();

    return jsonOk(mapOrderToDTO(order));
  })(request);
}
