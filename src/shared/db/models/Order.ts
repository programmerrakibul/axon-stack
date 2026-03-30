import { Schema, model, models, Types } from "mongoose";

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export interface IOrderItem {
  productId: Types.ObjectId;
  quantity: number;
  unitPriceSnapshot: number;
  lineTotal: number;
}

export interface IOrder {
  _id?: string;
  customerName: string;
  items: IOrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPriceSnapshot: {
      type: Number,
      required: true,
      min: 0,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false, // Don't create _id for nested items
  },
);

const orderSchema = new Schema<IOrder>(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (v: IOrderItem[]) => v.length > 0,
        message: "Order must have at least one item",
      },
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for customer orders sorted by creation date
orderSchema.index({ customerName: 1, createdAt: -1 });

// Index for filtering by status
orderSchema.index({ status: 1, createdAt: -1 });

// Export model using existing model if already compiled, otherwise create new
export const Order = models.Order || model<IOrder>("Order", orderSchema);
