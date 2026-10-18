import { useAuthContext } from "@/hooks/useAuthContext";
import { Refrigerator } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemHeader,
    ItemTitle,
} from "@/components/ui/item"

import pantryIcon from '../assets/icons/icons8-pantry-100.png';
import barcodeIcon from '../assets/icons/icons8-barcode-100.png';
import recognitionIcon from '../assets/icons/icons8-grocery-100.png';
import recipeIcon from '../assets/icons/icons8-recipe-100.png';
import mobileIcon from '../assets/icons/icons8-mobile-100.png';
import reportIcon from '../assets/icons/icons8-report-100.png';

const features = [
    {
        name: "Pantry Management",
        description: "Add, update, and delete pantry items with details like brand, category, quantity, and expiration date",
        image: pantryIcon
    },
    {
        name: "Barcode Scanning",
        description: "Scan product barcodes with your camera to auto-populate item details via the Open Food Facts API",
        image: barcodeIcon
    },
    {
        name: "Food Recognition",
        description: "Identify fruits and vegetables using a ML model through your device camera",
        image: recognitionIcon
    },
    {
        name: "Recipe Suggestions",
        description: "Get recipe ideas based on items expiring within 3 days (powered by Spoonacular API)",
        image: recipeIcon
    },
    {
        name: "Usage Reports",
        description: "Track consumption patterns and food waste analytics",
        image: reportIcon
    },
    {
        name: "PWA Support",
        description: " Installable as a progressive web app to use as a native mobile app",
        image: mobileIcon
    }
]

function LandingPage() {

    const { setGuestMode } = useAuthContext()
    const navigate = useNavigate()

    const handleTryOffline = () => {
        setGuestMode(true)
        navigate('/dashboard')
    }
    return (
        <>
            <main className="flex flex-1 flex-col justify-center mx-auto w-full max-w-4xl px-6 py-20">
                {/* Hero */}
                <div className="flex flex-col gap-5 items-center flex-center justify-center">

                    <div className="flex flex-col gap-8 items-center flex-1">
                        <Refrigerator className="size-15 w-25 text-gray-600" />
                        <h1 className="text-center text-2xl font-bold text-gray-600">
                            FridgePulse
                        </h1>
                        <p className="text-xl text-center text-gray-600 max-w-2xl">
                            Track your groceries and reduce food waste!
                        </p>
                        <div className="flex flex-row gap-4">
                            <Link to="/login">
                                <Button variant="outline" size="lg">Log In</Button>
                            </Link>
                            <Link to="/signup">
                                <Button variant="outline" size="lg">Sign Up</Button>
                            </Link>
                            <Button onClick={handleTryOffline}>Try Offline</Button>
                        </div>
                    </div>

                    <div className="flex flex-col mt-5">
                        <h2 className="mx-auto mb-5 w-1/4 max-w-md border-t py-5 text-center text-xl font-semibold text-gray-600">Features</h2>
                        <ItemGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature) => (
                                <Item key={feature.name} role="listitem" variant="muted" className="p-6 items-start content-start">
                                    <ItemHeader className="mb-2">
                                        <img
                                            src={feature.image}
                                            alt={feature.name}
                                            className="w-14 h-14 rounded-sm object-cover"
                                        />
                                    </ItemHeader>
                                    <ItemContent>
                                        <ItemTitle>{feature.name}</ItemTitle>
                                        <ItemDescription className="line-clamp-none text-gray-600">{feature.description}</ItemDescription>
                                    </ItemContent>
                                </Item>
                            ))}
                        </ItemGroup>
                    </div>
                </div>
            </main>
            <footer className="border-t px-5 py-5 text-center text-gray-600">
                <div className="flex flex-col gap-1">
                    <small>
                        Licensed under the{" "}
                        <a
                            className="underline cursor-pointer hover:text-gray-900"
                            href="https://www.apache.org/licenses/LICENSE-2.0"
                        >
                            Apache License, Version 2.0
                        </a>
                    </small>
                    <small>
                        Icons (Features) by{" "}
                        <a
                            className="underline cursor-pointer hover:text-gray-900"
                            href="https://icons8.com"
                        >
                            Icons8
                        </a>
                    </small>
                </div>
            </footer>
        </>
    );
}

export default LandingPage;