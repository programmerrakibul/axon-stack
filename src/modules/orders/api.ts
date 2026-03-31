import { apiFetch } from "@/shared/client/api";
import {
  type OrderDTO,
  type OrderCreateInput,
  type OrderQueryParams,
} from "./schemas";

/**
 * Fetch a paginated list of orders with optional filters
 */
export async function fetchOrders(params: OrderQueryParams): Promise<{
  orders: OrderDTO[];
  pagination: {
    total: number;
    skip: number;
    limit: number;
    hasMore: boolean;
  };
}> {
  const queryString = new URLSearchParams({
    skip: params.skip.toString(),
    limit: params.limit.toString(),
    ...(params.status && { status: params.status }),
    ...(params.search && { search: params.search }),
  }).toString();

  return apiFetch(`/api/orders?${queryString}`, { method: "GET" });
}

/**
 * Create a new order
 */
export async function createOrder(body: OrderCreateInput): Promise<OrderDTO> {
  return apiFetch("/api/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Confirm a pending order
 */
export async function confirmOrder(id: string): Promise<OrderDTO> {
  return apiFetch(`/api/orders/${id}/confirm`, { method: "POST" });
}

/**
 * Update the status of an order
 */
export async function updateOrderStatus(
  id: string,
  status: string,
): Promise<OrderDTO> {
  return apiFetch(`/api/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
