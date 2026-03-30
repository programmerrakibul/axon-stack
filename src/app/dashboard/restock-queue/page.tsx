"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Plus } from "lucide-react";

export default function RestockQueuePage() {
  const restockItems = [
    {
      id: 1,
      product: "Yoga Mat",
      sku: "YOGA-MAT",
      current: 8,
      threshold: 20,
      reorder: 50,
      priority: "High",
    },
    {
      id: 2,
      product: "React Guide Book",
      sku: "REACT-BK",
      current: 12,
      threshold: 15,
      reorder: 30,
      priority: "High",
    },
    {
      id: 3,
      product: "T-Shirt Blue",
      sku: "TS-BLUE-L",
      current: 67,
      threshold: 50,
      reorder: 100,
      priority: "Medium",
    },
    {
      id: 4,
      product: "Desk Lamp",
      sku: "LAMP-LED",
      current: 23,
      threshold: 30,
      reorder: 60,
      priority: "Medium",
    },
    {
      id: 5,
      product: "Wireless Headphones",
      sku: "WH-001",
      current: 45,
      threshold: 40,
      reorder: 80,
      priority: "Low",
    },
  ];

  const priorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-destructive/10 text-destructive";
      case "Medium":
        return "bg-warning/10 text-warning";
      case "Low":
        return "bg-primary/10 text-primary";
      default:
        return "bg-secondary/10 text-secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Restock Queue
          </h2>
          <p className="mt-2 text-secondary">Items needing restocking</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Restock Order
        </Button>
      </div>

      {/* Alert */}
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="flex items-center gap-3 pt-6">
          <AlertCircle className="h-5 w-5 text-warning flex-shrink-0" />
          <div>
            <p className="font-medium text-foreground">
              2 items require urgent restocking
            </p>
            <p className="text-sm text-secondary">
              Stock levels have dropped below minimum threshold
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Restock Queue</CardTitle>
          <CardDescription>Items with low inventory levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {restockItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-secondary/5 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.product}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-secondary">
                    <span>SKU: {item.sku}</span>
                    <span>Current: {item.current} units</span>
                    <span>Threshold: {item.threshold} units</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-secondary">Order Qty</p>
                    <p className="font-medium text-foreground">
                      {item.reorder}
                    </p>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${priorityColor(
                      item.priority
                    )}`}
                  >
                    {item.priority}
                  </span>
                  <Button variant="outline" size="sm">
                    Reorder
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
