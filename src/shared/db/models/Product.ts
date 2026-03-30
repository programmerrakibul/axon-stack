import { Schema, model, models, Types } from "mongoose";

export interface IProduct {
  _id?: string;
  name: string;
  categoryId: Types.ObjectId;
  price: number;
  stockQty: number;
  minThreshold: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stockQty: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minThreshold: {
      type: Number,
      required: true,
      min: 0,
      default: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for active products by category (useful for queries)
productSchema.index({ categoryId: 1, isActive: 1 });

// Stock level index for restock queries
productSchema.index({ stockQty: 1, minThreshold: 1 });

// Export model using existing model if already compiled, otherwise create new
export const Product =
  models.Product || model<IProduct>("Product", productSchema);
