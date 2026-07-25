import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { StoreProvider } from "@/lib/store";
import { SiteHeader } from "@/components/SiteHeader";
import { useUI } from "@/lib/ui-context";
import { LayoutGrid, Settings as SettingsIcon, Calendar, DollarSign } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — MotoRent" },
      { name: "description", content: "Manage inventory and settings." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { t } = useUI();
  return (
    <StoreProvider>
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[220px_1fr]">
          <aside className="h-max rounded-2xl border border-border bg-card p-3">
            <div className="px-3 pb-3 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("admin")}
            </div>
            <nav className="grid gap-1">
              <NavItem to="/admin" icon={<LayoutGrid className="size-4" />} exact>
                {t("admin_inventory")}
              </NavItem>
              <NavItem to="/admin/bookings" icon={<Calendar className="size-4" />}>
                {t("admin_bookings") || "Bookings"}
              </NavItem>
              <NavItem to="/admin/pricing" icon={<DollarSign className="size-4" />}>
                Bảng giá
              </NavItem>
              <NavItem to="/admin/settings" icon={<SettingsIcon className="size-4" />}>
                {t("admin_settings")}
              </NavItem>
            </nav>
          </aside>
          <main>
            <Outlet />
          </main>
        </div>
        <Toaster richColors position="top-center" />
      </div>
    </StoreProvider>
  );
}

function NavItem({
  to,
  icon,
  children,
  exact,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  exact?: boolean;
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: !!exact }}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground/70 hover:bg-muted hover:text-foreground"
      activeProps={{
        className:
          "flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground",
      }}
    >
      {icon}
      {children}
    </Link>
  );
}
