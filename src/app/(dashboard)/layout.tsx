import { Topbar } from "@/components/topbar";
import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Topbar />
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r border-border bg-background lg:block">
          <nav className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-6">
            <Sidebar />
          </nav>
        </aside>
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
