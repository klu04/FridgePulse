import { Refrigerator } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/ui/Header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card"

function LandingPage() {
    return (
        <div className="flex flex-col justify-center mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-0 lg:min-h-dvh">
            {/* Hero */}
            <div className="flex flex-col gap-8 items-center flex-center justify-center">
                <div className="flex flex-col gap-8 items-center flex-1">
                    <Refrigerator className="size-15 w-25 text-gray-600" />
                    <h1 className="text-center text-2xl font-bold text-gray-600">
                        ShelfLife
                    </h1>
                    <p className="text-xl text-center text-gray-600 max-w-2xl">
                        Track your groceries and reduce food waste!
                    </p>
                    <div className="flex flex-row gap-4">
                        <div className="flex flex-row gap-4">
                            <Link to="/login">
                                <Button variant="outline" size="lg">Log In</Button>
                            </Link>
                            <Link to="/">
                                <Button variant="outline" size="lg">Sign Up</Button>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="gap-16 mt-5">
                    <Header />
                    <div className="flex-col md:flex-row gap-8 items-stretch">
                        <Card></Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;
