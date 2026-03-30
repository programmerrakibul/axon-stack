import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { FolderOpen } from "lucide-react";

export default function CategoriesPage() {
  return (
    <Container>
      <PageHeader
        title="Categories"
        description="Manage your product categories"
        action={<Button>Add Category</Button>}
      />

      <div className="mt-8">
        <EmptyState
          icon={<FolderOpen className="h-12 w-12" />}
          title="No categories found"
          description="Get started by creating your first product category."
          action={<Button variant="outline">Create Category</Button>}
        />
      </div>
    </Container>
  );
}
