# Mongoose Database Setup

Complete MongoDB/Mongoose integration with connection reuse pattern optimized
for Next.js serverless environments.

## Architecture

### Connection Reuse Pattern

- **File:** `src/shared/db/connect.ts`
- **Features:**
  - Global connection caching to prevent pool exhaustion
  - Automatic retry and error handling
  - Proper timeout configuration
  - Connection pooling for serverless environments

### Models with Indexes

#### User

- **Fields:** email (unique), passwordHash, role (enum: ADMIN|MANAGER|CUSTOMER)
- **Indexes:** unique email, role-based filtering
- **Relations:** Referenced by ActivityLog, Order (customerName is text)

#### Category

- **Fields:** name (unique)
- **Indexes:** unique name for fast lookups
- **Relations:** Referenced by Product (categoryId)

#### Product

- **Fields:** name, categoryId (ref), price, stockQty, minThreshold, isActive
- **Indexes:**
  - Compound: (categoryId, isActive) for filtered category queries
  - Stock level: (stockQty, minThreshold) for restock detection
  - Price range queries optimized
- **Relations:** Referenced by RestockItem, Order items

#### RestockItem

- **Fields:** productId (unique), priority (1-100)
- **Indexes:** priority for priority-based reordering
- **Relations:** References Product (foreign key unique)

#### Order

- **Fields:** customerName, items (array of {productId, quantity,
  unitPriceSnapshot, lineTotal}), totalPrice, status (enum)
- **Indexes:**
  - Compound: (customerName, createdAt) for customer order history
  - Compound: (status, createdAt) for status-based filtering
- **Nested Items:** No \_id on items, automatic line total calculation available

#### ActivityLog

- **Fields:** message, type (enum), userId (optional), createdAt
- **Indexes:**
  - TTL: Auto-deletion after 30 days (2,592,000 seconds)
  - Compound: (userId, createdAt) for user activity history
  - Compound: (type, createdAt) for audit trail filtering
- **Relations:** References User (optional, sparse index)

## Usage

### Connecting to Database

```typescript
import { connectDB } from "@/shared/db";

// In API routes or server functions
export async function GET() {
  await connectDB();
  // Database operations here
}
```

### Using Models

```typescript
import { Product, Category, User } from "@/shared/db";

// Create
const category = await Category.create({ name: "Electronics" });

// Read
const products = await Product.find({
  categoryId: category._id,
  isActive: true,
});

// Update
await Product.findByIdAndUpdate(productId, { stockQty: 50 });

// Delete
await Product.deleteOne({ _id: productId });
```

### Type-Safe Operations

```typescript
import { IProduct, Product } from "@/shared/db";

const product: IProduct = await Product.findById(id);
console.log(product.name); // TypeScript autocomplete available
```

### Safe API Responses with DTOs

```typescript
import { Product, mapProductToDTO, mapProductsToDTO } from "@/shared/db";

// Single product
const product = await Product.findById(id);
if (product) {
  const dto = mapProductToDTO(product);
  // { id, name, categoryId, price, stockQty, minThreshold, isActive, needsRestock, createdAt, updatedAt }
  return Response.json(dto);
}

// Multiple products
const products = await Product.find();
const dtos = mapProductsToDTO(products);
return Response.json(dtos);
```

### DTO Mappers

| Model       | DTO Function            | Safe Fields                      |
| ----------- | ----------------------- | -------------------------------- |
| User        | `mapUserToDTO()`        | Excludes passwordHash            |
| Category    | `mapCategoryToDTO()`    | All fields                       |
| Product     | `mapProductToDTO()`     | Adds needsRestock computed field |
| RestockItem | `mapRestockItemToDTO()` | All fields                       |
| Order       | `mapOrderToDTO()`       | All fields with nested items     |
| ActivityLog | `mapActivityLogToDTO()` | All fields                       |

All DTOs include:

- `id` (converted from \_id)
- `createdAt`/`updatedAt` (ISO format strings)

### Batch Operations

```typescript
import { mapProductsToDTO } from "@/shared/db";

// Fetch and map in one step
const products = await Product.find({ isActive: true });
const response = mapProductsToDTO(products);
```

## Enums

### UserRole

- `ADMIN` - Full system access
- `MANAGER` - Manage products, orders
- `CUSTOMER` - View products, place orders

### OrderStatus

- `PENDING` - Order created, awaiting confirmation
- `CONFIRMED` - Order confirmed
- `SHIPPED` - Order shipped
- `DELIVERED` - Order delivered
- `CANCELLED` - Order cancelled

### ActivityType

- `USER_CREATED`, `USER_UPDATED`, `USER_DELETED`
- `PRODUCT_CREATED`, `PRODUCT_UPDATED`, `PRODUCT_DELETED`
- `ORDER_PLACED`, `ORDER_CANCELLED`
- `RESTOCK_INITIATED`
- `LOGIN`, `EXPORT`, `OTHER`

## Best Practices

1. **Always await connectDB()** before operations
2. **Use DTOs for API responses** - Never expose passwordHash or internal \_id
   format
3. **Leverage compound indexes** - Pre-built indexes optimize common queries
4. **Check needsRestock** - ProductDTO automatically calculates when
   `stockQty <= minThreshold`
5. **Reference models properly** - Use categoryId, productId as ObjectId
   references
6. **Activity logging** - Log all important operations for audit trail
7. **TTL indexes** - ActivityLogs auto-delete after 30 days

## Files Structure

```
src/shared/db/
├── connect.ts              # Connection reuse & pooling
├── index.ts                # Central exports
├── dtos.ts                 # All DTO mappers & types
└── models/
    ├── User.ts             # User model & interface
    ├── Category.ts         # Category model & interface
    ├── Product.ts          # Product model & interface
    ├── RestockItem.ts      # RestockItem model & interface
    ├── Order.ts            # Order & OrderItem models
    └── ActivityLog.ts      # ActivityLog model & interface
```

## Connection Configuration

Connection parameters from `.env.local`:

- `MONGODB_URI` - MongoDB connection string (validated in env.ts)
- **Timeout:** 5 seconds (server selection)
- **Socket Timeout:** 45 seconds
- **Connect Timeout:** 10 seconds
- **Write Concern:** Majority replica set
- **Retry Writes:** Enabled

## Error Handling

```typescript
import { connectDB } from "@/shared/db";

try {
  await connectDB();
  // Your database operation
} catch (error) {
  console.error("Database error:", error);
  return Response.json({ error: "Database operation failed" }, { status: 500 });
}
```

## Environment Variables Required

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
```

See `.env.example` for production setup instructions.
