import { Link, Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/commonUI/AppSidebar";
import BottomNav from "@/components/commonUI/BottomNav";
import Header from "@/components/commonUI/Header";
import { Plus, ScanBarcode, ScanEye } from "lucide-react";
import { GuestBanner } from '@/components/auth/GuestBanner'
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const allRoutes = [
  { to: "/dashboard", label: "Home" },
  { to: "/kitchen", label: "Kitchen" },
  { to: "/recipes", label: "Recipes" },
  { to: "/reports", label: "Reports" },
  { to: "/add-item", label: "Add Product" },
  { to: "/scan-barcode", label: "Scan Barcode" },
  { to: "/scan-object", label: "Scan Products" },
];

export default function AuthLayout() {
  const location = useLocation();

  const isScanning = location.pathname.includes("scan-object") ||
    location.pathname.includes("scan-barcode");

  const activeRoute = allRoutes.find(
    (r) => location.pathname === r.to || location.pathname.startsWith(`${r.to}/`)
  );
  const pageTitle = activeRoute?.label ?? "ShelfLife";
  const fabRoutes = ["/dashboard", "/kitchen", "recipes", "/reports"];
  const showFab = fabRoutes.includes(activeRoute?.to);

  if (isScanning) return <Outlet />;

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="flex-1 flex flex-col min-w-0">
        <Header title={pageTitle} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-16 md:pb-4 max-w-full">
          <GuestBanner />
          <Outlet />
        </main>
      </SidebarInset>

      {showFab && (
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  className="hidden md:flex fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 h-14 w-14 rounded-full shadow-lg"
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Create</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent side="top" align="end" className="mb-2 w-max">
            <DropdownMenuItem asChild>
              <Link to="/add-item">
                <Plus className="mr-2 h-4 w-4 shrink-0" /> 
                Add Product
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/scan-barcode">
                <ScanBarcode className="mr-2 h-4 w-4 shrink-0" /> 
                Scan Barcode
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/scan-object">
                <ScanEye className="mr-2 h-4 w-4 shrink-0" /> 
                Scan Products
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      )}

      <div className="md:hidden">
        <BottomNav />
      </div>
    </SidebarProvider>
  );
}