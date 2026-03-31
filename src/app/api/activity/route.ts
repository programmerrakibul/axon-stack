import { connectDB, ActivityLog } from "@/shared/db";
import { withErrorHandling, jsonOk } from "@/shared/server/handler";
import { requireSessionUser } from "@/shared/server/require";
import { Types } from "mongoose";

export type ActivityDTO = {
  _id: string;
  message: string;
  type: string;
  createdAt: string;
};

/**
 * GET /api/activity
 * Returns the last 10 activity log entries sorted by createdAt descending
 */
export const GET = withErrorHandling(async (_request: Request) => {
  await requireSessionUser();
  await connectDB();

  const docs = await ActivityLog.find({})
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const dtos: ActivityDTO[] = docs.map((doc) => {
    const d = doc as unknown as {
      _id: Types.ObjectId;
      message: string;
      type: string;
      createdAt: Date;
    };
    return {
      _id: d._id.toString(),
      message: d.message,
      type: d.type,
      createdAt: d.createdAt.toISOString(),
    };
  });

  return jsonOk(dtos);
});
