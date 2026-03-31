import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { apiFetch, ApiClientError } from "@/shared/client/api";
import {
  type CategoryDTO,
  type CategoryCreateInput,
  type CategoryQueryParams,
} from "./schemas";

/**
 * List categories with optional pagination and search
 * @param params Pagination and filter parameters
 */
export async function listCategories(params: CategoryQueryParams): Promise<{
  categories: CategoryDTO[];
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
  }).toString();

  return apiFetch(`/api/categories?${queryString}`, {
    method: "GET",
  });
}

/**
 * Create a new category
 * @param data Category creation data
 */
export async function createCategory(
  data: CategoryCreateInput,
): Promise<CategoryDTO> {
  return apiFetch("/api/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * TanStack Query hook for listing categories
 * Automatically refetches when params change
 *
 * @param params Pagination and filter parameters
 * @returns Query result with categories and pagination info
 *
 * @example
 * const { data, isLoading, error } = useListCategories({
 *   skip: 0,
 *   limit: 10,
 *   search: 'electronics'
 * });
 *
 * if (error instanceof ApiClientError) {
 *   toast.error(error.message);
 * }
 */
export function useListCategories(params: CategoryQueryParams): UseQueryResult<
  {
    categories: CategoryDTO[];
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
    queryKey: ["categories", params.skip, params.limit, params.search],
    queryFn: () => listCategories(params),
    retry: 1,
  });
}

/**
 * TanStack Query hook for creating a category
 * Automatically invalidates category list on success
 *
 * @returns Mutation result with mutate function
 *
 * @example
 * const { mutate, isPending } = useCreateCategory();
 *
 * const handleCreate = async (name: string) => {
 *   mutate({ name }, {
 *     onSuccess: (category) => {
 *       toast.success(`Created: ${category.name}`);
 *     },
 *     onError: (error) => {
 *       if (error.isCode('VALIDATION_ERROR')) {
 *         toast.error('Invalid category name');
 *       }
 *     }
 *   });
 * };
 */
export function useCreateCategory(): UseMutationResult<
  CategoryDTO,
  ApiClientError,
  CategoryCreateInput
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      // Invalidate all category queries
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
