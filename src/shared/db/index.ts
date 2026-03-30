/**
 * Database module exports
 * Central location for all DB-related imports
 */

// Connection utilities
export {
  connectDB,
  disconnectDB,
  getConnection,
  resetConnection,
} from "./connect";

// Models
export { User, type IUser, UserRole } from "./models/User";
export { Category, type ICategory } from "./models/Category";
export { Product, type IProduct } from "./models/Product";
export { RestockItem, type IRestockItem } from "./models/RestockItem";
export {
  Order,
  type IOrder,
  type IOrderItem,
  OrderStatus,
} from "./models/Order";
export {
  ActivityLog,
  type IActivityLog,
  ActivityType,
} from "./models/ActivityLog";

// DTOs and mappers
export {
  type UserDTO,
  mapUserToDTO,
  mapUsersToDTO,
  type CategoryDTO,
  mapCategoryToDTO,
  mapCategoriesToDTO,
  type ProductDTO,
  mapProductToDTO,
  mapProductsToDTO,
  type RestockItemDTO,
  mapRestockItemToDTO,
  mapRestockItemsToDTO,
  type OrderDTO,
  type OrderItemDTO,
  mapOrderToDTO,
  mapOrdersToDTO,
  type ActivityLogDTO,
  mapActivityLogToDTO,
  mapActivityLogsToDTO,
} from "./dtos";
