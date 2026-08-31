import { Link, useLocation } from "react-router-dom";
import {
    Sidebar,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarHeader,
    SidebarFooter,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, Refrigerator, ChefHat, BarChart3, ScanLine, ScanBarcode, Utensils, LogOut } from "lucide-react";
import { useAuthContext } from "@/hooks/useAuthContext";

const menuItems = [
    { to: "/dashboard", label: "Home", Icon: Home },
    { to: "/kitchen", label: "Kitchen", Icon: Refrigerator },
    { to: "/recipes", label: "Recipes", Icon: ChefHat },
    { to: "/reports", label: "Reports", Icon: BarChart3 },
];

const actionItems = [
    { to: "/add-item", label: "Add Product", Icon: Utensils },
    { to: "/scan-barcode", label: "Scan Barcode", Icon: ScanBarcode },
    { to: "/scan-object", label: "Scan Products", Icon: ScanLine },
];

export default function AppSidebar() {
    const location = useLocation();
    const { logout, user, isGuest } = useAuthContext();

    return (
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
                            {/* Show email for auth users, "Guest" for guest mode */}
                            <span className="text-sm text-muted-foreground truncate group-data-[collapsible=icon]:hidden">
                                {isGuest ? 'Guest' : user?.email}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={logout}
                                aria-label="Log out"
                                className="ml-auto group-data-[collapsible=icon]:ml-0"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}