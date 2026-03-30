"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Edit,
  Trash2,
  ShoppingCart,
  Package,
  AlertCircle,
} from "lucide-react";

export default function ActivityPage() {
  const activities = [
    {
      id: 1,
      type: "order",
      action: "Order Created",
      description: "Order ORD-5003 created by admin",
      timestamp: "2 minutes ago",
      icon: ShoppingCart,
    },
    {
      id: 2,
      type: "product",
      action: "Product Updated",
      description: "Wireless Headphones stock updated to 45 units",
      timestamp: "15 minutes ago",
      icon: Package,
    },
    {
      id: 3,
      type: "alert",
      action: "Low Stock Alert",
      description: "Yoga Mat has low inventory (8 units)",
      timestamp: "1 hour ago",
      icon: AlertCircle,
    },
    {
      id: 4,
      type: "product",
      action: "Product Created",
      description: "New product added: Desk Lamp",
      timestamp: "3 hours ago",
      icon: Plus,
    },
    {
      id: 5,
      type: "order",
      action: "Order Shipped",
      description: "Order ORD-5001 marked as shipped",
      timestamp: "5 hours ago",
      icon: ShoppingCart,
    },
    {
      id: 6,
      type: "product",
      action: "Product Deleted",
      description: "Old product removed from inventory",
      timestamp: "1 day ago",
      icon: Trash2,
    },
    {
      id: 7,
      type: "product",
      action: "Product Updated",
      description: "USB-C Cable price updated",
      timestamp: "2 days ago",
      icon: Edit,
    },
    {
      id: 8,
      type: "alert",
      action: "Restock Completed",
      description: "500 units of T-Shirt Blue received",
      timestamp: "2 days ago",
      icon: Package,
    },
  ];

  const getActivityColor = (type: string) => {
    switch (type) {
      case "order":
        return "bg-primary/10 text-primary";
      case "product":
        return "bg-secondary/10 text-secondary";
      case "alert":
        return "bg-warning/10 text-warning";
      default:
        return "bg-secondary/10 text-secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Activity Log
        </h2>
        <p className="mt-2 text-secondary">
          Track all system activities and changes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            All system activities in chronological order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 rounded-lg border border-border p-4 hover:bg-secondary/5 transition-colors"
                >
                  <div
                    className={`rounded-lg p-2 ${getActivityColor(
                      activity.type
                    )}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      {activity.action}
                    </p>
                    <p className="text-sm text-secondary mt-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-secondary/70 mt-2">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
