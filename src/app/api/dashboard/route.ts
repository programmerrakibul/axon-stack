import { connectDB, Order, Product, User } from "@/shared/db";
import { withErrorHandling, jsonOk } from "@/shared/server/handler";
import { requireSessionUser } from "@/shared/server/require";

export type DashboardDTO = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
};

/**
 * GET /api/dashboard
 * Returns aggregated KPI metrics for the admin dashboard
 */
export const GET = withErrorHandling(async (_request: Request) => {
  await requireSessionUser();
  await connectDB();

  const [revenueResult, totalOrders, totalProducts, totalUsers] =
    await Promise.all([
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
      Order.countDocuments({}),
      Product.countDocuments({}),
      User.countDocuments({}),
    ]);

  const dto: DashboardDTO = {
    totalRevenue: revenueResult.length > 0 ? revenueResult[0].total : 0,
    totalOrders,
    totalProducts,
    totalUsers,
  };

  return jsonOk(dto);
});
