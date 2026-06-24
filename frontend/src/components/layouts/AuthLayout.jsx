import { Outlet, useLocation, Link } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarInset,
  SidebarFooter,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, Refrigerator, ChefHat, BarChart3, ScanLine, ScanBarcode, Utensils, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/commonUI/BottomNav";
import Header from "@/components/commonUI/Header";

export default function AuthLayout() {
  const location = useLocation();
  const { logout, user } = useAuth();

  const isScanning = location.pathname.includes("scan-object") || location.pathname.includes("scan-barcode");

  const menuItems = [
    { to: "/dashboard", label: "Home", Icon: Home },
    { to: "/all-items", label: "Kitchen", Icon: Refrigerator },
    { to: "/recipes", label: "Recipes", Icon: ChefHat },
    { to: "/reports", label: "Reports", Icon: BarChart3 },
  ];

  const actionItems = [
    { to: "/add-item", label: "Add Product", Icon: Utensils },
    { to: "/scan-barcode", label: "Scan Barcode", Icon: ScanBarcode },
    { to: "/scan-object", label: "Scan Products", Icon: ScanLine },
  ];

  // Handle dynamic header name
  const allRoutes = [...menuItems, ...actionItems];

  const activeRoute = allRoutes.find(route =>
    location.pathname === route.to || location.pathname.startsWith(`${route.to}/`)
  );

  const pageTitle = activeRoute?.label || (location.pathname === "/" ? "Home" :  "ShelfLife");

  if (isScanning) {
    return <Outlet />;
  }

  return (
    <SidebarProvider>
      {/* Sidebar */}
      <Sidebar collapsible="icon" className="group hidden md:flex">
        <SidebarHeader className="flex flex-row mb-2 h-16 items-center justify-between gap-2 border-b px-4 group-data-[collapsible=icon]:justify-center">
          <h2 className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
            ShelfLife
          </h2>
          <SidebarTrigger className="-ml-1" />
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem
                key={item.to}
                className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-end"
              >
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.to}
                  tooltip={item.label}
                  className="justify-start group-data-[collapsible=icon]:justify-end"
                >
                  <Link to={item.to}>
                    <item.Icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          <SidebarMenu>
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground group-data-[collapsible=icon]:hidden">
              Actions
            </div>
            {actionItems.map((item) => (
              <SidebarMenuItem
                key={item.to}
                className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-end"
              >
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.to}
                  tooltip={item.label}
                  className="justify-start group-data-[collapsible=icon]:justify-end"
                >
                  <Link to={item.to}>
                    <item.Icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:justify-center">
                {user?.email && (
                  <span className="text-sm text-muted-foreground truncate group-data-[collapsible=icon]:hidden">
                    {user.email}
                  </span>
                )}
                <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out" className="ml-auto group-data-[collapsible=icon]:ml-0">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <SidebarInset className="flex-1 flex flex-col min-w-0">
        <Header title={pageTitle}/>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-16 md:pb-4 max-w-full">
          <Outlet />
        </main>
      </SidebarInset>

      {/* Mobile: Bottom Navigation */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </SidebarProvider>
  );
}