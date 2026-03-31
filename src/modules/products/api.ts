import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { apiFetch, ApiClientError } from "@/shared/client/api";
import { type ProductDTO } from "@/shared/db";
import type {
  ProductCreateInput,
  ProductUpdateInput,
  ProductQueryParams,
  RestockUpdateInput,
  RestockQueryParams,
} from "./schemas";

/**
 * List products with pagination, search, and filtering
 * @param params Pagination and filter parameters
 */
export async function listProducts(params: ProductQueryParams): Promise<{
  products: ProductDTO[];
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
    ...(params.search && { search: params.search }),
    ...(params.categoryId && { categoryId: params.categoryId }),
    ...(params.isActive !== undefined && {
      isActive: params.isActive.toString(),
    }),
    ...(params.needsRestockOnly && { needsRestockOnly: "true" }),
  }).toString();

  return apiFetch(`/api/products?${queryString}`, {
    method: "GET",
  });
}

/**
 * Get a single product by ID
 * @param id Product ID
 */
export async function getProduct(id: string): Promise<ProductDTO> {
  return apiFetch(`/api/products/${id}`, {
    method: "GET",
  });
}

/**
 * Create a new product
 * @param data Product creation data
 */
export async function createProduct(
  data: ProductCreateInput,
): Promise<ProductDTO> {
  return apiFetch("/api/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Update a product
 * @param id Product ID
 * @param data Partial product data to update
 */
export async function updateProduct(
  id: string,
  data: ProductUpdateInput,
): Promise<ProductDTO> {
  return apiFetch(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Delete (soft delete) a product
 * @param id Product ID
 */
export async function deleteProduct(
  id: string,
): Promise<{ success: boolean; message: string }> {
  return apiFetch(`/api/products/${id}`, {
    method: "DELETE",
  });
}

/**
 * List restock items with sorting and pagination
 * @param params Pagination and sort parameters
 */
export async function listRestockItems(params: RestockQueryParams): Promise<{
  restockItems: Array<any>;
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
    sortBy: params.sortBy,
    order: params.order,
  }).toString();

  return apiFetch(`/api/restock?${queryString}`, {
    method: "GET",
  });
}

/**
 * Get restock status for a specific product
 * @param productId Product ID
 */
export async function getRestockItem(productId: string): Promise<any> {
  return apiFetch(`/api/restock/${productId}`, {
    method: "GET",
  });
}

/**
 * Update restock priority for a product
 * @param productId Product ID
 * @param data Update data (priority)
 */
export async function updateRestockPriority(
  productId: string,
  data: RestockUpdateInput,
): Promise<any> {
  return apiFetch(`/api/restock/${productId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Remove a product from the restock queue
 * @param productId Product ID
 */
export async function removeFromRestockQueue(productId: string): Promise<{
  success: boolean;
  message: string;
}> {
  return apiFetch(`/api/restock/${productId}`, {
    method: "DELETE",
  });
}

// ============= TanStack Query Hooks =============

/**
 * TanStack Query hook for listing products
 * Automatically refetches when params change
 */
export function useListProducts(params: ProductQueryParams): UseQueryResult<
  {
    products: ProductDTO[];
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
    queryKey: [
      "products",
      params.skip,
      params.limit,
      params.search,
      params.categoryId,
      params.isActive,
      params.needsRestockOnly,
    ],
    queryFn: () => listProducts(params),
    retry: 1,
  });
}

/**
 * TanStack Query hook for getting a single product
 */
export function useGetProduct(
  id: string | null,
): UseQueryResult<ProductDTO, ApiClientError> {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => getProduct(id!),
    enabled: !!id,
    retry: 1,
  });
}

/**
 * TanStack Query hook for creating a product
 * Automatically invalidates product list on success
 */
export function useCreateProduct(): UseMutationResult<
  ProductDTO,
  ApiClientError,
  ProductCreateInput
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/**
 * TanStack Query hook for updating a product
 * Automatically invalidates product queries on success
 */
export function useUpdateProduct(
  id: string,
): UseMutationResult<ProductDTO, ApiClientError, ProductUpdateInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", id] });
      // Also invalidate restock query if stock was updated
      queryClient.invalidateQueries({ queryKey: ["restock"] });
    },
  });
}

/**
 * TanStack Query hook for deleting a product
 * Automatically invalidates product list on success
 */
export function useDeleteProduct(): UseMutationResult<
  { success: boolean; message: string },
  ApiClientError,
  string
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/**
 * TanStack Query hook for listing restock items
 * Automatically refetches when params change
 */
export function useListRestockItems(params: RestockQueryParams): UseQueryResult<
  {
    restockItems: Array<any>;
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
    queryKey: [
      "restock",
      params.skip,
      params.limit,
      params.sortBy,
      params.order,
    ],
    queryFn: () => listRestockItems(params),
    retry: 1,
  });
}

/**
 * TanStack Query hook for getting a single restock item
 */
export function useGetRestockItem(
  productId: string | null,
): UseQueryResult<any, ApiClientError> {
  return useQuery({
    queryKey: ["restock", productId],
    queryFn: () => getRestockItem(productId!),
    enabled: !!productId,
    retry: 1,
  });
}

/**
 * TanStack Query hook for updating restock priority
 * Automatically invalidates restock queries on success
 */
export function useUpdateRestockPriority(
  productId: string,
): UseMutationResult<any, ApiClientError, RestockUpdateInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => updateRestockPriority(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restock"] });
      queryClient.invalidateQueries({ queryKey: ["restock", productId] });
    },
  });
}

/**
 * TanStack Query hook for removing from restock queue
 * Automatically invalidates restock queries on success
 */
export function useRemoveFromRestockQueue(): UseMutationResult<
  { success: boolean; message: string },
  ApiClientError,
  string
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFromRestockQueue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restock"] });
    },
  });
}
