import { Schema, model, models, Types } from "mongoose";

export enum ActivityType {
  USER_CREATED = "USER_CREATED",
  USER_UPDATED = "USER_UPDATED",
  USER_DELETED = "USER_DELETED",
  PRODUCT_CREATED = "PRODUCT_CREATED",
  PRODUCT_UPDATED = "PRODUCT_UPDATED",
  PRODUCT_DELETED = "PRODUCT_DELETED",
  ORDER_PLACED = "ORDER_PLACED",
  ORDER_CANCELLED = "ORDER_CANCELLED",
  RESTOCK_INITIATED = "RESTOCK_INITIATED",
  LOGIN = "LOGIN",
  EXPORT = "EXPORT",
  OTHER = "OTHER",
}

export interface IActivityLog {
  _id?: string;
  message: string;
  type: ActivityType;
  userId?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(ActivityType),
      default: ActivityType.OTHER,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// TTL index for auto-deletion of old logs (30 days)
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

// Compound index for user activity sorted by date
activityLogSchema.index({ userId: 1, createdAt: -1 });

// Index for type-based queries
activityLogSchema.index({ type: 1, createdAt: -1 });

// Export model using existing model if already compiled, otherwise create new
export const ActivityLog =
  models.ActivityLog || model<IActivityLog>("ActivityLog", activityLogSchema);
