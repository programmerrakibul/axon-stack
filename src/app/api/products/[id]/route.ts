import { Types } from "mongoose";
import { connectDB, Product, mapProductToDTO } from "@/shared/db";
import { toAppError, jsonOk, jsonError } from "@/shared/server/handler";
import { requireSessionUser } from "@/shared/server/require";
import { assertPermission } from "@/shared/server/rbac";
import { productUpdateSchema } from "@/modules/products/schemas";
import { BadRequestError } from "@/shared/server/errors";
import { syncRestockForProduct } from "@/shared/server/stock";

/**
 * GET /api/products/[id]
 * Get a single product by ID
 */
export async function GET(_request: Request, props: any) {
  try {
    await connectDB();

    const { id } = await props.params;

    // Validate MongoDB ID format
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid product ID format");
    }

    // Fetch product
    const product = await Product.findById(id);
    if (!product) {
      throw new BadRequestError("Product not found");
    }

    return jsonOk(mapProductToDTO(product));
  } catch (err) {
    const appError = toAppError(err);
    return jsonError(appError);
  }
}

/**
 * PUT /api/products/[id]
 * Update a product (requires catalog:edit permission)
 *
 * Body (all fields optional):
 * {
 *   name?: string,
 *   categoryId?: string,
 *   price?: number,
 *   stockQty?: number,
 *   minThreshold?: number,
 *   isActive?: boolean
 * }
 */
export async function PUT(request: Request, props: any) {
  try {
    await connectDB();

    const { id } = await props.params;

    // Require authenticated user
    const user = await requireSessionUser();

    // Check permission
    assertPermission(user.role, "catalog:edit");

    // Validate MongoDB ID format
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid product ID format");
    }

    // Fetch product
    const product = await Product.findById(id);
    if (!product) {
      throw new BadRequestError("Product not found");
    }

    // Parse and validate request body
    const body = await request.json();
    const updates = productUpdateSchema.parse(body);

    // Check for duplicate name if name is being updated
    if (updates.name && updates.name !== product.name) {
      const existingProduct = await Product.findOne({
        name: updates.name,
        _id: { $ne: id },
      });
      if (existingProduct) {
        throw new BadRequestError("Product with this name already exists", {
          field: "name",
          value: updates.name,
        });
      }
    }

    // Apply updates
    Object.assign(product, updates);
    await product.save();

    // Sync restock status after stock changes
    if (updates.stockQty !== undefined || updates.minThreshold !== undefined) {
      await syncRestockForProduct(product);
    }

    return jsonOk(mapProductToDTO(product));
  } catch (err) {
    const appError = toAppError(err);
    return jsonError(appError);
  }
}

/**
 * DELETE /api/products/[id]
 * Soft delete a product by setting isActive to false (requires catalog:delete permission)
 */
export async function DELETE(_request: Request, props: any) {
  try {
    await connectDB();

    const { id } = await props.params;

    // Require authenticated user
    const user = await requireSessionUser();

    // Check permission
    assertPermission(user.role, "catalog:delete");

    // Validate MongoDB ID format
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid product ID format");
    }

    // Fetch product
    const product = await Product.findById(id);
    if (!product) {
      throw new BadRequestError("Product not found");
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    // Remove from restock queue if present
    const { RestockItem } = await import("@/shared/db");
    await RestockItem.deleteOne({ productId: id });

    return jsonOk({ success: true, message: "Product deleted" });
  } catch (err) {
    const appError = toAppError(err);
    return jsonError(appError);
  }
}
