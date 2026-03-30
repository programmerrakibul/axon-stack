import { IUser, UserRole } from "./models/User";
import { ICategory } from "./models/Category";
import { IProduct } from "./models/Product";
import { IRestockItem } from "./models/RestockItem";
import { IOrder, IOrderItem, OrderStatus } from "./models/Order";
import { IActivityLog, ActivityType } from "./models/ActivityLog";

/**
 * Data Transfer Objects (DTOs) for safe API responses
 * Excludes sensitive fields and provides type-safe response structures
 */

// User DTOs
export interface UserDTO {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export function mapUserToDTO(user: IUser): UserDTO {
  return {
    id: user._id?.toString() || "",
    email: user.email,
    role: user.role,
    createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

// Category DTOs
export interface CategoryDTO {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export function mapCategoryToDTO(category: ICategory): CategoryDTO {
  return {
    id: category._id?.toString() || "",
    name: category.name,
    createdAt: category.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: category.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

// Product DTOs
export interface ProductDTO {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  stockQty: number;
  minThreshold: number;
  isActive: boolean;
  needsRestock: boolean;
  createdAt: string;
  updatedAt: string;
}

export function mapProductToDTO(product: IProduct): ProductDTO {
  const needsRestock = product.stockQty <= product.minThreshold;
  return {
    id: product._id?.toString() || "",
    name: product.name,
    categoryId: product.categoryId?.toString() || "",
    price: product.price,
    stockQty: product.stockQty,
    minThreshold: product.minThreshold,
    isActive: product.isActive,
    needsRestock,
    createdAt: product.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: product.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

// RestockItem DTOs
export interface RestockItemDTO {
  id: string;
  productId: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export function mapRestockItemToDTO(item: IRestockItem): RestockItemDTO {
  return {
    id: item._id?.toString() || "",
    productId: item.productId?.toString() || "",
    priority: item.priority,
    createdAt: item.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: item.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

// Order DTOs
export interface OrderItemDTO {
  productId: string;
  quantity: number;
  unitPriceSnapshot: number;
  lineTotal: number;
}

export interface OrderDTO {
  id: string;
  customerName: string;
  items: OrderItemDTO[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export function mapOrderToDTO(order: IOrder): OrderDTO {
  return {
    id: order._id?.toString() || "",
    customerName: order.customerName,
    items: order.items.map((item: IOrderItem) => ({
      productId: item.productId?.toString() || "",
      quantity: item.quantity,
      unitPriceSnapshot: item.unitPriceSnapshot,
      lineTotal: item.lineTotal,
    })),
    totalPrice: order.totalPrice,
    status: order.status,
    createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: order.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

// ActivityLog DTOs
export interface ActivityLogDTO {
  id: string;
  message: string;
  type: ActivityType;
  userId?: string;
  createdAt: string;
}

export function mapActivityLogToDTO(log: IActivityLog): ActivityLogDTO {
  return {
    id: log._id?.toString() || "",
    message: log.message,
    type: log.type,
    userId: log.userId?.toString(),
    createdAt: log.createdAt?.toISOString() || new Date().toISOString(),
  };
}

/**
 * Batch mapping utilities
 */

export function mapUsersToDTO(users: IUser[]): UserDTO[] {
  return users.map(mapUserToDTO);
}

export function mapCategoriesToDTO(categories: ICategory[]): CategoryDTO[] {
  return categories.map(mapCategoryToDTO);
}

export function mapProductsToDTO(products: IProduct[]): ProductDTO[] {
  return products.map(mapProductToDTO);
}

export function mapRestockItemsToDTO(items: IRestockItem[]): RestockItemDTO[] {
  return items.map(mapRestockItemToDTO);
}

export function mapOrdersToDTO(orders: IOrder[]): OrderDTO[] {
  return orders.map(mapOrderToDTO);
}

export function mapActivityLogsToDTO(logs: IActivityLog[]): ActivityLogDTO[] {
  return logs.map(mapActivityLogToDTO);
}
