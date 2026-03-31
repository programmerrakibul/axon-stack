import { Types } from "mongoose";
import { connectDB, RestockItem, mapRestockItemToDTO } from "@/shared/db";
import { toAppError, jsonOk, jsonError } from "@/shared/server/handler";
import { requireSessionUser } from "@/shared/server/require";
import { assertPermission } from "@/shared/server/rbac";
import { restockUpdateSchema } from "@/modules/products/schemas";
import { BadRequestError } from "@/shared/server/errors";

/**
 * GET /api/restock/[productId]
 * Get restock item status for a specific product
 */
export async function GET(_request: Request, props: any) {
  try {
    await connectDB();

    const { productId } = await props.params;

    // Validate MongoDB ID format
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestError("Invalid product ID format");
    }

    // Fetch restock item
    const restockItem = await RestockItem.findOne({ productId }).populate({
      path: "productId",
      model: "Product",
      select: "name stockQty minThreshold price",
    });

    if (!restockItem) {
      throw new BadRequestError("Product is not in restock queue");
    }

    const dto = mapRestockItemToDTO(restockItem);
    const product = restockItem.productId as any;

    return jsonOk({
      ...dto,
      productName: product?.name || "Unknown",
      stockQty: product?.stockQty || 0,
      minThreshold: product?.minThreshold || 0,
      price: product?.price || 0,
      stockPercentage: product?.minThreshold
        ? Math.round((product.stockQty / product.minThreshold) * 100)
        : 0,
    });
  } catch (err) {
    const appError = toAppError(err);
    return jsonError(appError);
  }
}

/**
 * PUT /api/restock/[productId]
 * Update restock priority for a product (requires catalog:edit permission)
 *
 * Body:
 * {
 *   priority: number (1-100)
 * }
 */
export async function PUT(request: Request, props: any) {
  try {
    await connectDB();

    const { productId } = await props.params;

    // Require authenticated user
    const user = await requireSessionUser();

    // Check permission
    assertPermission(user.role, "catalog:edit");

    // Validate MongoDB ID format
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestError("Invalid product ID format");
    }

    // Parse and validate request body
    const body = await request.json();
    const { priority } = restockUpdateSchema.parse(body);

    // Fetch restock item
    const restockItem = await RestockItem.findOne({ productId });
    if (!restockItem) {
      throw new BadRequestError("Product is not in restock queue");
    }

    // Update priority
    restockItem.priority = priority;
    await restockItem.save();

    const dto = mapRestockItemToDTO(restockItem);
    return jsonOk({
      ...dto,
      message: "Priority updated successfully",
    });
  } catch (err) {
    const appError = toAppError(err);
    return jsonError(appError);
  }
}

/**
 * DELETE /api/restock/[productId]
 * Remove product from restock queue (requires catalog:edit permission)
 * Usually done after restocking is complete
 */
export async function DELETE(_request: Request, props: any) {
  try {
    await connectDB();

    const { productId } = await props.params;

    // Require authenticated user
    const user = await requireSessionUser();

    // Check permission
    assertPermission(user.role, "catalog:edit");

    // Validate MongoDB ID format
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestError("Invalid product ID format");
    }

    // Delete restock item
    const result = await RestockItem.deleteOne({ productId });

    if (result.deletedCount === 0) {
      throw new BadRequestError("Product is not in restock queue");
    }

    return jsonOk({
      success: true,
      message: "Removed from restock queue",
    });
  } catch (err) {
    const appError = toAppError(err);
    return jsonError(appError);
  }
}
