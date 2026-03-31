# Categories Module

A complete categories management system with shared Zod validation, typed API
endpoints, and TanStack Query integration.

## Architecture

### 1. Shared Schemas (`src/modules/categories/schemas.ts`)

Type-safe Zod schemas used by both client and server:

```typescript
// Create validation
export const categoryCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be no more than 100 characters")
    .trim(),
});
export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;

// Update validation (for future use)
export const categoryUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be no more than 100 characters")
    .trim(),
});
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;

// Query parameters with pagination
export const categoryQuerySchema = z.object({
  skip: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
});
export type CategoryQueryParams = z.infer<typeof categoryQuerySchema>;
```

**Features:**

- ✅ Shared between client and server
- ✅ Automatic TypeScript inference
- ✅ Consistent validation rules
- ✅ Clear error messages

### 2. API Routes (`src/app/api/categories/route.ts`)

#### GET /api/categories

List categories with pagination and optional search:

```typescript
export const GET = withErrorHandling(async (request: Request) => {
  await connectDB();

  // Validate query params using schema
  const queryParams = categoryQuerySchema.parse({
    skip: searchParams.get("skip"),
    limit: searchParams.get("limit"),
    search: searchParams.get("search"),
  });

  // Build MongoDB filter
  const filter: Record<string, unknown> = {};
  if (queryParams.search) {
    filter.name = { $regex: queryParams.search, $options: "i" };
  }

  // Fetch with pagination
  const categories = await Category.find(filter)
    .skip(queryParams.skip)
    .limit(queryParams.limit)
    .sort({ createdAt: -1 });

  const total = await Category.countDocuments(filter);

  return jsonOk({
    categories: categories.map(mapCategoryToDTO),
    pagination: {
      total,
      skip: queryParams.skip,
      limit: queryParams.limit,
      hasMore: queryParams.skip + queryParams.limit < total,
    },
  });
});
```

**Response (200):**

```json
{
  "ok": true,
  "data": {
    "categories": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Electronics",
        "createdAt": "2024-03-31T10:00:00Z",
        "updatedAt": "2024-03-31T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "skip": 0,
      "limit": 10,
      "hasMore": true
    }
  }
}
```

#### POST /api/categories

Create a new category (requires authentication and `catalog:create` permission):

```typescript
export const POST = withErrorHandling(async (request: Request) => {
  await connectDB();

  // Require authenticated user
  const user = await requireSessionUser();

  // Check permission - ADMIN and MANAGER only
  assertPermission(user.role, "catalog:create");

  // Validate body
  const body = await request.json();
  const { name } = categoryCreateSchema.parse(body);

  // Check for duplicates
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    throw new BadRequestError("Category with this name already exists", {
      field: "name",
      value: name,
    });
  }

  // Create and return
  const category = await Category.create({ name });
  return jsonOk(mapCategoryToDTO(category), { status: 201 });
});
```

**Request:**

```json
{
  "name": "Electronics"
}
```

**Response (201):**

```json
{
  "ok": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Electronics",
    "createdAt": "2024-03-31T10:00:00Z",
    "updatedAt": "2024-03-31T10:00:00Z"
  }
}
```

**Error Responses:**

Validation Error (400):

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "issues": [
        {
          "field": "name",
          "code": "too_small",
          "message": "Category name must be at least 2 characters"
        }
      ]
    }
  }
}
```

Duplicate Error (400):

```json
{
  "ok": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Category with this name already exists",
    "details": {
      "field": "name",
      "value": "Electronics"
    }
  }
}
```

Unauthorized (401):

```json
{
  "ok": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

Forbidden (403):

```json
{
  "ok": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Permission denied: CUSTOMER does not have catalog:create"
  }
}
```

### 3. Client API (`src/modules/categories/api.ts`)

Typed API functions and TanStack Query hooks:

#### `listCategories(params)`

```typescript
export async function listCategories(params: CategoryQueryParams): Promise<{
  categories: CategoryDTO[];
  pagination: { total: number; skip: number; limit: number; hasMore: boolean };
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
```

#### `useListCategories(params)`

TanStack Query hook for fetching categories:

```typescript
export function useListCategories(
  params: CategoryQueryParams,
): UseQueryResult<...> {
  return useQuery({
    queryKey: ["categories", params.skip, params.limit, params.search],
    queryFn: () => listCategories(params),
    retry: 1,
  });
}

// Usage
const { data, isLoading, error } = useListCategories({
  skip: 0,
  limit: 10,
  search: 'electronics'
});
```

#### `createCategory(data)`

```typescript
export async function createCategory(
  data: CategoryCreateInput,
): Promise<CategoryDTO> {
  return apiFetch("/api/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
```

#### `useCreateCategory()`

TanStack Query hook for creating categories:

```typescript
export function useCreateCategory(): UseMutationResult<...> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      // Auto-invalidate all category queries on success
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

// Usage
const { mutate, isPending } = useCreateCategory();

mutate({ name: "Electronics" }, {
  onSuccess: (category) => {
    toast.success(`Created: ${category.name}`);
  },
  onError: (error) => {
    if (error.isCode('VALIDATION_ERROR')) {
      // Handle validation
      const issues = (error.details as any)?.issues || [];
      toast.error(issues[0].message);
    }
  },
});
```

### 4. Categories Page (`src/app/(dashboard)/dashboard/categories/page.tsx`)

Complete example page demonstrating:

- ✅ Form validation with React Hook Form + Zod
- ✅ Category listing with pagination
- ✅ Error handling with ApiClientError
- ✅ Sonner toast notifications
- ✅ Loading states
- ✅ Empty state
- ✅ "Load More" pagination
- ✅ ValidationError message extraction (shows first issue)

**Features:**

```typescript
"use client";

// 1. Query categories
const { data, isLoading, error } = useListCategories({
  skip,
  limit: 10,
});

// 2. Create category mutation with auto-invalidation
const { mutate: createCategory, isPending } = useCreateCategory();

// 3. Handle ApiClientError with typed error checking
if (listError instanceof ApiClientError) {
  let errorMessage = listError.message;

  // Extract first validation issue
  if (listError.isCode("VALIDATION_ERROR") && listError.details) {
    const details = listError.details as any;
    if (Array.isArray(details.issues) && details.issues.length > 0) {
      errorMessage = details.issues[0].message;
    }
  }

  return <ErrorCard message={errorMessage} />;
}

// 4. Show toast on success/error
mutate(formData, {
  onSuccess: (category) => {
    toast.success(`Category "${category.name}" created!`);
    reset();
  },
  onError: (error) => {
    let message = error.message;
    if (error.isCode("VALIDATION_ERROR")) {
      const issues = (error.details as any)?.issues || [];
      message = issues[0]?.message || message;
    }
    toast.error(message);
  },
});
```

## Error Handling Flow

### Client Error Handling Pattern

```typescript
try {
  // API call via apiFetch
  const category = await apiFetch("/api/categories", {...});
} catch (error) {
  if (error instanceof ApiClientError) {
    // Type-safe error checking
    if (error.isCode("VALIDATION_ERROR")) {
      // Extract validation issues
      const issues = (error.details as any)?.issues || [];
      issues.forEach(issue => {
        console.error(`${issue.field}: ${issue.message}`);
      });
    } else if (error.isCode("BAD_REQUEST")) {
      // Handle business logic errors
    } else if (error.isCode("FORBIDDEN")) {
      // Handle permission errors
    }

    // Show first issue or generic message
    toast.error(error.message);
  }
}
```

### Validation Error Display

When server returns `ValidationError` with multiple issues, show the first one:

```typescript
if (error.isCode("VALIDATION_ERROR") && error.details) {
  const details = error.details as any;
  if (Array.isArray(details.issues) && details.issues.length > 0) {
    // Show: "Category name must be at least 2 characters"
    toast.error(details.issues[0].message);
  }
}
```

**Server response:**

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "issues": [
        {
          "field": "name",
          "code": "too_small",
          "message": "Category name must be at least 2 characters"
        },
        {
          "field": "name",
          "code": "invalid_string",
          "message": "Name cannot contain special characters"
        }
      ]
    }
  }
}
```

## Type Safety

End-to-end type safety from database to UI:

```typescript
// 1. Server creates Category (MongoDB model)
const category = await Category.create({ name });

// 2. Maps to CategoryDTO
const dto = mapCategoryToDTO(category);

// 3. Returns in ApiResponse<CategoryDTO>
return jsonOk(dto);

// 4. Client receives typed data
const { categories }: { categories: CategoryDTO[] } = await apiFetch(...);

// 5. Form uses same schema as server
const form = useForm<CategoryCreateInput>({
  resolver: zodResolver(categoryCreateSchema),
});
```

## Permissions

Categories operations require RBAC permissions:

| Operation                      | Permission       | Allowed Roles           |
| ------------------------------ | ---------------- | ----------------------- |
| **GET** /api/categories        | None (public)    | All authenticated users |
| **POST** /api/categories       | `catalog:create` | ADMIN, MANAGER          |
| **PUT** /api/categories/:id    | `catalog:edit`   | ADMIN, MANAGER          |
| **DELETE** /api/categories/:id | `catalog:delete` | ADMIN                   |

## Query Parameters

### GET /api/categories

| Param    | Type   | Default | Description                             |
| -------- | ------ | ------- | --------------------------------------- |
| `skip`   | number | 0       | Number of items to skip                 |
| `limit`  | number | 10      | Max items to return (max 100)           |
| `search` | string | -       | Search category name (case-insensitive) |

**Examples:**

```bash
# Get first 10 categories
GET /api/categories

# Get next 10 categories
GET /api/categories?skip=10&limit=10

# Search for Electronics
GET /api/categories?search=electronics

# Paginate with search
GET /api/categories?skip=0&limit=10&search=elec
```

## Common Patterns

### Listing with Pagination

```typescript
const [skip, setSkip] = useState(0);
const { data, isLoading } = useListCategories({
  skip,
  limit: 10,
});

const handleLoadMore = () => {
  setSkip(skip + 10);
};
```

### Creating with Optimistic Update

```typescript
const { mutate } = useCreateCategory();

mutate(
  { name: "Electronics" },
  {
    onSuccess: () => {
      // List is auto-invalidated by hook
      toast.success("Created!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  },
);
```

### Handling Different Error Types

```typescript
const { mutate } = useCreateCategory();

mutate(data, {
  onError: (error) => {
    if (error.isCode("VALIDATION_ERROR")) {
      const issues = (error.details as any)?.issues || [];
      issues.forEach((issue) => {
        console.error(`${issue.field}: ${issue.message}`);
      });
    } else if (error.isCode("BAD_REQUEST")) {
      // Duplicate name
      toast.error("Category already exists");
    } else if (error.isCode("FORBIDDEN")) {
      // No permission
      toast.error("You don't have permission to create categories");
    }
  },
});
```

## File Structure

```
src/
├── modules/categories/
│   ├── schemas.ts              # Shared Zod schemas
│   └── api.ts                  # Client API functions & hooks
├── app/api/categories/
│   └── route.ts                # GET/POST endpoints
└── app/(dashboard)/dashboard/
    └── categories/
        └── page.tsx            # Categories page
```

## Testing

### API Tests

```bash
# List categories
curl http://localhost:3000/api/categories

# Create category
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Electronics"}'

# With pagination
curl "http://localhost:3000/api/categories?skip=0&limit=5"

# With search
curl "http://localhost:3000/api/categories?search=elec"
```

### Client Checklist

- [ ] List categories successfully
- [ ] Load more works with pagination
- [ ] Create form validates input
- [ ] Create shows validation errors from server
- [ ] Create shows duplicate name error
- [ ] Create shows permission error for non-MANAGER users
- [ ] Success toast on create
- [ ] List auto-refresh after create (query invalidation)
- [ ] Search functionality works
- [ ] Empty state when no categories
- [ ] Loading states show properly

## Future Enhancements

- [ ] Update category (PUT endpoint + hook)
- [ ] Delete category (DELETE endpoint + hook)
- [ ] Bulk operations
- [ ] Category filtering by creation date
- [ ] Export categories as CSV
- [ ] Category statistics (product count per category)
- [ ] Category reordering/sorting

## Related Files

- [src/modules/categories/schemas.ts](src/modules/categories/schemas.ts) - Zod
  schemas
- [src/modules/categories/api.ts](src/modules/categories/api.ts) - Client API &
  hooks
- [src/app/api/categories/route.ts](src/app/api/categories/route.ts) - API
  endpoints
- [src/app/(dashboard)/dashboard/categories/page.tsx](<src/app/(dashboard)/dashboard/categories/page.tsx>) -
  UI page
- [API_ERROR_HANDLING.md](API_ERROR_HANDLING.md) - Global error system
- [SIGNUP_AUTH_UI.md](SIGNUP_AUTH_UI.md) - Auth module reference
