"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function OrdersPage() {
  const orders = [
    {
      id: "ORD-5001",
      customer: "John Doe",
      items: 3,
      total: "$345.99",
      status: "Completed",
      date: "2024-03-29",
    },
    {
      id: "ORD-5002",
      customer: "Jane Smith",
      items: 1,
      total: "$129.99",
      status: "Processing",
      date: "2024-03-30",
    },
    {
      id: "ORD-5003",
      customer: "Bob Johnson",
      items: 5,
      total: "$567.45",
      status: "Shipped",
      date: "2024-03-28",
    },
    {
      id: "ORD-5004",
      customer: "Alice Brown",
      items: 2,
      total: "$89.98",
      status: "Pending",
      date: "2024-03-30",
    },
    {
      id: "ORD-5005",
      customer: "Charlie Wilson",
      items: 4,
      total: "$234.56",
      status: "Completed",
      date: "2024-03-27",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-success/10 text-success";
      case "Processing":
        return "bg-primary/10 text-primary";
      case "Shipped":
        return "bg-primary/10 text-primary";
      case "Pending":
        return "bg-warning/10 text-warning";
      default:
        return "bg-secondary/10 text-secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Orders
          </h2>
          <p className="mt-2 text-secondary">Manage customer orders</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>All customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">
                    Order ID
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">
                    Customer
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-foreground">
                    Items
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">
                    Total
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">
                    Date
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border hover:bg-secondary/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-foreground font-medium">
                      {order.id}
                    </td>
                    <td className="py-3 px-4 text-foreground">
                      {order.customer}
                    </td>
                    <td className="py-3 px-4 text-center text-secondary">
                      {order.items}
                    </td>
                    <td className="py-3 px-4 text-right text-foreground font-medium">
                      {order.total}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-secondary">{order.date}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
