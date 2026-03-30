import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

export default function ProductsPage() {
  return (
    <Container>
      <PageHeader
        title="Products"
        description="Manage your product inventory"
        action={<Button>Add Product</Button>}
      />

      <div className="mt-8">
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title="No products found"
          description="Get started by adding your first product."
          action={<Button variant="outline">Create Product</Button>}
        />
      </div>
    </Container>
  );
}
