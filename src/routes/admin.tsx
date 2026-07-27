import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { StoreProvider } from "@/lib/store";
import { SiteHeader } from "@/components/SiteHeader";
import { useUI } from "@/lib/ui-context";
import { LayoutGrid, Settings as SettingsIcon, Calendar, DollarSign } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — JAN'S MOTORBIKE" },
      { name: "description", content: "Manage inventory and settings." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { t } = useUI();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<"admin" | "staff" | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth");
    const storedRole = localStorage.getItem("adminRole") as "admin" | "staff" | null;
    if (auth === "true" && storedRole) {
      setRole(storedRole);
      setIsAuthenticated(true);
    }
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const adminUser = import.meta.env.VITE_ADMIN_USERNAME || "admin";
    const staffUser = import.meta.env.VITE_STAFF_USERNAME || "staff";

    if (username === adminUser && password === import.meta.env.VITE_ADMIN_PASSWORD) {
      localStorage.setItem("adminAuth", "true");
      localStorage.setItem("adminRole", "admin");
      setRole("admin");
      setIsAuthenticated(true);
    } else if (username === staffUser && password === import.meta.env.VITE_STAFF_PASSWORD) {
      localStorage.setItem("adminAuth", "true");
      localStorage.setItem("adminRole", "staff");
      setRole("staff");
      setIsAuthenticated(true);
    } else {
      setError("Sai tài khoản hoặc mật khẩu" || "Invalid credentials");
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="mb-6 text-center font-display text-2xl font-bold">Admin Login</h1>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div>
              <input
                type="text"
                placeholder="Username (ID)"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mb-3"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                autoFocus
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
              />
              {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

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
              {role === "admin" && (
                <NavItem to="/admin/pricing" icon={<DollarSign className="size-4" />}>
                  Bảng giá
                </NavItem>
              )}
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
