import { Refrigerator } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function LandingPage() {
    return (
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-0 lg:min-h-dvh flex flex-col justify-center">
            {/* Hero */}
            <div className="flex flex-col gap-8 items-center flex-center justify-center">
                <div className="flex flex-col gap-8 items-center flex-1">
                    <Refrigerator className="size-15 w-25" />
                    <h1 className="text-center text-2xl font-bold text-gray-800">
                        ShelfLife
                    </h1>
                    <p className="text-xl text-center text-gray-500 max-w-2xl">
                        Track your groceries and reduce food waste!
                    </p>
                    <div className="flex flex-row gap-4">
                        <div className="flex flex-row gap-4">
                            <Link to="/loginpage">
                                <Button variant="outline" size="lg">Log In</Button>
                            </Link>
                            <Link to="/">
                                <Button variant="outline" size="lg">Sign Up</Button>
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default LandingPage;
