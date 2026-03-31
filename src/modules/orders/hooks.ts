import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { ApiClientError } from "@/shared/client/api";
import {
  fetchOrders,
  createOrder,
  confirmOrder,
  updateOrderStatus,
} from "./api";
import { type OrderDTO, type OrderCreateInput, type OrderQueryParams } from "./schemas";

/**
 * TanStack Query hook for fetching a paginated list of orders
 * Automatically refetches when params change
 */
export function useOrders(params: OrderQueryParams): UseQueryResult<
  {
    orders: OrderDTO[];
    pagination: {
      total: number;
      skip: number;
      limit: number;
      hasMore: boolean;
    };
  },
  ApiClientError
> {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => fetchOrders(params),
    retry: 1,
  });
}

/**
 * TanStack Query hook for creating a new order
 * Invalidates the orders list on success
 */
export function useCreateOrder(): UseMutationResult<
  OrderDTO,
  ApiClientError,
  OrderCreateInput
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

/**
 * TanStack Query hook for confirming a pending order
 * Invalidates the orders list on success
 */
export function useConfirmOrder(): UseMutationResult<
  OrderDTO,
  ApiClientError,
  string
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

/**
 * TanStack Query hook for updating an order's status
 * Invalidates the orders list on success
 */
export function useUpdateOrderStatus(): UseMutationResult<
  OrderDTO,
  ApiClientError,
  { id: string; status: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
