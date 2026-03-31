import mongoose from "mongoose";
import { Order, Product, type IOrderItem, OrderStatus } from "@/shared/db";
import { ConflictError, BadRequestError } from "./errors";
import { connectDB } from "@/shared/db/connect";

/**
 * Order item with resolved price information
 */
export interface OrderItemWithPrice extends IOrderItem {
  productName: string;
  availableStock: number;
}

/**
 * Calculate totals for order items
 * Fetches current product prices and validates stock availability
 *
 * @param items Order items with productId and quantity
 * @returns Order items with prices, totals, and calculated line totals
 */
export async function calculateOrderTotals(
  items: Array<{ productId: string; quantity: number }>,
): Promise<{
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  totalPrice: number;
  availabilityCheck: Array<{
    productId: string;
    requested: number;
    available: number;
    sufficient: boolean;
  }>;
}> {
  // Fetch all products in order
  const productIds = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  if (products.length !== productIds.length) {
    throw new BadRequestError("One or more products not found");
  }

  // Build product map for quick lookup
  const productMap = new Map(products.map((p) => [p._id?.toString() || "", p]));

  // Calculate totals and check availability
  const calculatedItems = [];
  const availabilityCheck = [];
  let totalPrice = 0;

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new BadRequestError(`Product ${item.productId} not found`);
    }

    const lineTotal = product.price * item.quantity;
    totalPrice += lineTotal;

    calculatedItems.push({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: product.price,
      lineTotal,
    });

    availabilityCheck.push({
      productId: item.productId,
      requested: item.quantity,
      available: product.stockQty,
      sufficient: product.stockQty >= item.quantity,
    });
  }

  return {
    items: calculatedItems,
    totalPrice,
    availabilityCheck,
  };
}

/**
 * Assert that an order can be confirmed
 * Validates stock availability for all items
 *
 * @param availabilityCheck Availability check result from calculateOrderTotals
 * @returns Availability info if all items sufficient
 * @throws ConflictError if any item has insufficient stock
 */
export function assertCanConfirmOrder(
  availabilityCheck: Array<{
    productId: string;
    requested: number;
    available: number;
    sufficient: boolean;
  }>,
): void {
  for (const check of availabilityCheck) {
    if (!check.sufficient) {
      throw new ConflictError(
        `Only ${check.available} items available in stock`,
        {
          productId: check.productId,
          requested: check.requested,
          available: check.available,
        },
      );
    }
  }
}

/**
 * Confirm order with atomic stock deduction
 * Uses MongoDB transaction to ensure atomicity:
 * 1. Check stock availability
 * 2. Deduct stock from products
 * 3. Set order status to CONFIRMED
 *
 * @param orderId Order ID to confirm
 * @returns Updated order
 * @throws ConflictError if stock is insufficient
 * @throws BadRequestError if order invalid or already confirmed
 */
export async function confirmOrder(orderId: string) {
  await connectDB();
  const session = await mongoose.connection.startSession();
  session.startTransaction();

  try {
    // Fetch order and lock it
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      throw new BadRequestError("Order not found");
    }

    // Only PENDING orders can be confirmed
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestError(
        `Cannot confirm order with status ${order.status}. Only PENDING orders can be confirmed.`,
      );
    }

    // Check and deduct stock atomically
    for (const item of order.items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        throw new BadRequestError(`Product ${item.productId} not found`);
      }

      // Check stock is still available
      if (product.stockQty < item.quantity) {
        throw new ConflictError(
          `Only ${product.stockQty} items available in stock`,
          {
            productId: item.productId,
            requested: item.quantity,
            available: product.stockQty,
          },
        );
      }

      // Deduct stock atomically
      const updated = await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stockQty: -item.quantity } },
        { session, new: true },
      );

      if (!updated) {
        throw new BadRequestError(`Failed to update product ${item.productId}`);
      }
    }

    // Confirm order
    order.status = OrderStatus.CONFIRMED;
    await order.save({ session });

    await session.commitTransaction();
    return order;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
}

/**
 * Assert valid order status transition
 *
 * @param currentStatus Current order status
 * @param newStatus Desired new status
 * @throws BadRequestError if transition invalid
 */
export function assertValidStatusTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
): void {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
  };

  const allowed = validTransitions[currentStatus];
  if (!allowed.includes(newStatus)) {
    throw new BadRequestError(
      `Cannot transition from ${currentStatus} to ${newStatus}. Valid transitions: ${allowed.join(", ")}`,
    );
  }
}

/**
 * Restore stock when order is cancelled
 * Used when transitioning from CONFIRMED/SHIPPED -> CANCELLED
 *
 * @param orderId Order ID to restore stock for
 */
export async function restoreStockForCancelledOrder(orderId: string) {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new BadRequestError("Order not found");
  }

  for (const item of order.items) {
    await Product.findByIdAndUpdate(
      item.productId,
      { $inc: { stockQty: item.quantity } },
      { new: true },
    );
  }
}
