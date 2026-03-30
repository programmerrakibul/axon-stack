import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export default function UsersPage() {
  return (
    <Container>
      <PageHeader
        title="Users"
        description="Manage users and permissions"
        action={<Button>Add User</Button>}
      />

      <div className="mt-8">
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No users found"
          description="Get started by inviting your first user."
          action={<Button variant="outline">Invite User</Button>}
        />
      </div>
    </Container>
  );
}
