import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const Header = ({title}) => {
    const { logout, user } = useAuth();

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 md:hidden">
            <div className="flex h-14 items-center justify-between px-4">
                <h1 className="text-lg font-bold tracking-tight">{title}</h1>

                <div className="flex items-center gap-2">
                    {user?.email && (
                        <span className="text-sm text-muted-foreground sm:inline-block">
                            {user.email}
                        </span>
                    )}

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={logout}
                        aria-label="Log out"
                    >
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </header>
    );
}

export default Header;