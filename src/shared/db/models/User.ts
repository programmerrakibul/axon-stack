import { Schema, model, models } from "mongoose";

export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  CUSTOMER = "CUSTOMER",
}

export interface IUser {
  _id?: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Create unique index on email with sparse option for deleted docs
userSchema.index({ email: 1 }, { unique: true, sparse: true });

// Export model using existing model if already compiled, otherwise create new
export const User = models.User || model<IUser>("User", userSchema);
