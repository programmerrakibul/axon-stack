import { Schema, model, models } from "mongoose";

export interface ICategory {
  _id?: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Create unique index on name
categorySchema.index({ name: 1 }, { unique: true, sparse: true });

// Export model using existing model if already compiled, otherwise create new
export const Category =
  models.Category || model<ICategory>("Category", categorySchema);
