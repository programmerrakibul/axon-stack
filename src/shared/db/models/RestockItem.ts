import { Schema, model, models, Types } from "mongoose";

export interface IRestockItem {
  _id?: string;
  productId: Types.ObjectId;
  priority: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const restockItemSchema = new Schema<IRestockItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
      index: true,
    },
    priority: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
      default: 50,
    },
  },
  {
    timestamps: true,
  },
);

// Index for priority-based sorting
restockItemSchema.index({ priority: -1 });

// Export model using existing model if already compiled, otherwise create new
export const RestockItem =
  models.RestockItem || model<IRestockItem>("RestockItem", restockItemSchema);
