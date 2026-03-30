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

export default function ProductsPage() {
  const products = [
    {
      id: 1,
      name: "Wireless Headphones",
      sku: "WH-001",
      category: "Electronics",
      stock: 45,
      price: "$129.99",
    },
    {
      id: 2,
      name: "USB-C Cable",
      sku: "USB-C-01",
      category: "Electronics",
      stock: 234,
      price: "$12.99",
    },
    {
      id: 3,
      name: "T-Shirt Blue",
      sku: "TS-BLUE-L",
      category: "Clothing",
      stock: 67,
      price: "$24.99",
    },
    {
      id: 4,
      name: "React Guide Book",
      sku: "REACT-BK",
      category: "Books",
      stock: 12,
      price: "$49.99",
    },
    {
      id: 5,
      name: "Desk Lamp",
      sku: "LAMP-LED",
      category: "Home & Garden",
      stock: 23,
      price: "$39.99",
    },
    {
      id: 6,
      name: "Yoga Mat",
      sku: "YOGA-MAT",
      category: "Sports",
      stock: 8,
      price: "$35.99",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Products
          </h2>
          <p className="mt-2 text-secondary">Manage your inventory</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>All products in your system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">
                    SKU
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">
                    Category
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">
                    Stock
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">
                    Price
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-border hover:bg-secondary/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-foreground font-medium">
                      {product.name}
                    </td>
                    <td className="py-3 px-4 text-secondary">{product.sku}</td>
                    <td className="py-3 px-4 text-secondary">
                      {product.category}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          product.stock > 20
                            ? "bg-success/10 text-success"
                            : product.stock > 10
                              ? "bg-warning/10 text-warning"
                              : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {product.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-foreground font-medium">
                      {product.price}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm">
                        Edit
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
