"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch, ApiClientError } from "@/shared/client/api";
import type { DashboardDTO } from "@/app/api/dashboard/route";

export default function DashboardPage() {
  const { data, isPending, error } = useQuery<DashboardDTO>({
    queryKey: ["dashboard"],
    queryFn: () => apiFetch("/api/dashboard"),
  });

  useEffect(() => {
    if (!error) return;
    if (error instanceof ApiClientError) {
      toast(error.message);
    } else {
      toast("Failed to load dashboard data");
    }
  }, [error]);

  const cards = data
    ? [
        {
          title: "Total Revenue",
          value: `$${data.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        },
        { title: "Total Orders", value: data.totalOrders.toLocaleString() },
        { title: "Total Products", value: data.totalProducts.toLocaleString() },
        { title: "Total Users", value: data.totalUsers.toLocaleString() },
      ]
    : [];

  return (
    <Container>
      <PageHeader
        title="Dashboard"
        description="Welcome to your AxonStack dashboard"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isPending
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))
          : cards.map((card) => (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {card.value}
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </Container>
  );
}
