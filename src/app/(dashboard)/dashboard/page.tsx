import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <Container>
      <PageHeader
        title="Dashboard"
        description="Welcome to your AxonStack dashboard"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Revenue", value: "$45,231.89", change: "+20.1%" },
          { title: "Total Orders", value: "1,234", change: "+15.3%" },
          { title: "Total Products", value: "573", change: "+4.3%" },
          { title: "Total Users", value: "892", change: "+12.5%" },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
