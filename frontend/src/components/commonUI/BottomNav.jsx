import { Link, useLocation } from "react-router-dom";
import { Home, Refrigerator, ChefHat, BarChart3, Plus, Utensils, ScanLine, ScanBarcode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerClose
} from "@/components/ui/drawer";

const left_nav = [
    { to: "/dashboard", label: "Home", Icon: Home, end: true },
    { to: "/kitchen", label: "Kitchen", Icon: Refrigerator },
];

const right_nav = [
    { to: "/recipes", label: "Recipes", Icon: ChefHat },
    { to: "/reports", label: "Reports", Icon: BarChart3 },
];

function NavLink({ to, label, Icon, end, pathname }) {

    const isActive = end
        ? pathname === to
        : pathname === to || pathname.startsWith(`${to}/`);

    return (
        <Button
            asChild
            variant="ghost"
            className={cn(
                "h-16 w-full flex-col gap-1 rounded-none text-xs font-medium transition-colors",
                isActive
                    ? "text-primary hover:text-primary hover:bg-transparent"
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
            )}
        >
            <Link to={to} aria-current={isActive ? "page" : undefined}>
                <span
                    className={cn(
                        "flex h-6 w-10 items-center justify-center rounded-xl transition-colors",
                        isActive
                            ? "bg-primary text-white"
                            : "bg-transparent text-current"
                    )}
                >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>{label}</span>
            </Link>
        </Button>
    );
}

const BottomNav = ({ className }) => {
    const { pathname } = useLocation();

    // Disable bottom nav in scanning mode
    if (pathname === "/scan-object" || pathname === "/scan-barcode") return null;

    return (
        <nav
            aria-label="Primary"
            className={cn(
                "fixed inset-x-0 bottom-0 z-50 border-t bg-background pb-[calc(env(safe-area-inset-bottom)+0.5rem)] md:hidden",
                className
            )}
        >
            <div className="flex items-end justify-between">
                {/* Left nav items */}
                {left_nav.map((item) => (
                    <div key={item.to} className="flex flex-1 justify-center">
                        <NavLink {...item} pathname={pathname} />
                    </div>
                ))}

                {/* Add Button */}
                <div className="mx-2 -mt-6">
                    <Drawer>
                        <DrawerTrigger asChild>
                            <Button
                                size="icon"
                                className="h-12 w-12 mb-2 rounded-2xl shadow-lg"
                                aria-label="Open Options"
                            >
                                <Plus className="h-6 w-6" />
                            </Button>
                        </DrawerTrigger>

                        <DrawerContent>
                            <div className="p-4 space-y-2">

                                {/* Option 1: Add a food item */}
                                <DrawerClose asChild>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-left h-12 px-4 font-normal active:bg-muted transition-colors"
                                        asChild
                                    >
                                        <Link to="/add-item">
                                            <Utensils className="mr-3 h-5 w-5 text-muted-foreground" />
                                            <span>Add Product</span>
                                        </Link>
                                    </Button>
                                </DrawerClose>

                                {/* Option 2: Scan barcode */}
                                <DrawerClose asChild>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-left h-12 px-4 font-normal active:bg-muted transition-colors"
                                        asChild
                                    >
                                        <Link to="/scan-barcode">
                                            <ScanBarcode className="mr-3 h-5 w-5 text-muted-foreground" />
                                            <span>Scan Barcode</span>
                                        </Link>
                                    </Button>
                                </DrawerClose>

                                {/* Option 3: Scan product */}
                                <DrawerClose asChild>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-left h-12 px-4 font-normal active:bg-muted transition-colors"
                                        asChild
                                    >
                                        <Link to="/scan-object">
                                            <ScanLine className="mr-3 h-5 w-5 text-muted-foreground" />
                                            <span>Scan Products</span>
                                        </Link>
                                    </Button>
                                </DrawerClose>


                            </div>
                        </DrawerContent>
                    </Drawer>
                </div>

                {/* Right nav items */}
                {right_nav.map((item) => (
                    <div key={item.to} className="flex flex-1 justify-center">
                        <NavLink {...item} pathname={pathname} />
                    </div>
                ))}
            </div>
        </nav>
    );
}

export default BottomNav;