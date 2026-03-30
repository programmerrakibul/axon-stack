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

export default function CategoriesPage() {
  const categories = [
    { id: 1, name: "Electronics", items: 234, created: "Jan 15, 2024" },
    { id: 2, name: "Clothing", items: 456, created: "Jan 20, 2024" },
    { id: 3, name: "Books", items: 178, created: "Feb 10, 2024" },
    { id: 4, name: "Home & Garden", items: 345, created: "Feb 28, 2024" },
    { id: 5, name: "Sports", items: 98, created: "Mar 5, 2024" },
    { id: 6, name: "Food & Beverage", items: 567, created: "Mar 12, 2024" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Categories
          </h2>
          <p className="mt-2 text-secondary">Manage product categories</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>A list of all product categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-secondary/5 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{category.name}</p>
                  <p className="text-sm text-secondary">
                    {category.items} items • Created {category.created}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
