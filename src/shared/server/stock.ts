import { Product, RestockItem, type IProduct } from "@/shared/db";

/**
 * Derives a restock priority score based on stock level vs threshold
 * Lower stock levels get higher priority (1-100 scale)
 *
 * Formula:
 * - If stockQty <= 0: priority = 100 (critical)
 * - If 0 < stockQty < minThreshold: priority = 75 + (10 * (1 - stockQty/minThreshold))
 * - If stockQty >= minThreshold: priority = 25 + (25 * (1 - stockQty/(minThreshold * 2)))
 *
 * @param stockQty Current stock quantity
 * @param minThreshold Minimum threshold for this product
 * @returns Priority score (1-100)
 *
 * @example
 * deriveRestockPriority(0, 10) // Returns 100 (out of stock)
 * deriveRestockPriority(5, 10) // Returns ~82 (below threshold)
 * deriveRestockPriority(15, 10) // Returns ~37 (above threshold)
 */
export function deriveRestockPriority(
  stockQty: number,
  minThreshold: number,
): number {
  // Out of stock - critical
  if (stockQty <= 0) {
    return 100;
  }

  // Below threshold - high priority
  if (stockQty < minThreshold) {
    // Scale from 75-85 based on how far below threshold
    const percentBelow = 1 - stockQty / minThreshold;
    return Math.round(75 + 10 * percentBelow);
  }

  // Above threshold - lower priority
  // Scale from 25-50 based on distance above threshold
  const percentAbove = Math.min(1, stockQty / (minThreshold * 2));
  return Math.round(25 + 25 * (1 - percentAbove));
}

/**
 * Synchronizes restock item for a product
 * Creates new restock item if product needs restocking and doesn't have one
 * Updates existing restock item priority if needed
 *
 * @param product The product document or product ID
 * @returns The restock item if product needs restocking, null otherwise
 *
 * @example
 * const product = await Product.findById(id);
 * const restockItem = await syncRestockForProduct(product);
 *
 * // Or by ID:
 * const restockItem = await syncRestockForProduct(productId);
 */
export async function syncRestockForProduct(
  product: IProduct | string,
): Promise<any | null> {
  // Fetch product if ID was passed
  let productDoc: IProduct | null = null;

  if (typeof product === "string") {
    productDoc = await Product.findById(product);
    if (!productDoc) {
      throw new Error(`Product with ID ${product} not found`);
    }
  } else {
    productDoc = product;
  }

  const needsRestock = productDoc.stockQty <= productDoc.minThreshold;

  if (!needsRestock) {
    // Product doesn't need restock - delete entry if exists
    if (productDoc._id) {
      await RestockItem.deleteOne({ productId: productDoc._id });
    }
    return null;
  }

  // Product needs restock - create or update
  const priority = deriveRestockPriority(
    productDoc.stockQty,
    productDoc.minThreshold,
  );

  let restockItem = await RestockItem.findOne({ productId: productDoc._id });

  if (restockItem) {
    // Update priority if changed significantly
    if (Math.abs(restockItem.priority - priority) >= 5) {
      restockItem.priority = priority;
      await restockItem.save();
    }
  } else {
    // Create new restock item
    restockItem = await RestockItem.create({
      productId: productDoc._id,
      priority,
    });
  }

  return restockItem;
}

/**
 * Syncs restock items for multiple products at once
 * Useful for batch operations after inventory updates
 *
 * @param productIds Array of product IDs to sync
 * @returns Object mapping productId to restock status
 */
export async function syncRestockForProducts(
  productIds: string[],
): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};

  for (const id of productIds) {
    try {
      const result = await syncRestockForProduct(id);
      results[id] = result !== null;
    } catch {
      results[id] = false;
    }
  }

  return results;
}
