import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { daysUntilExpiry, ExpiryBadge, rowColor } from "@/lib/expiry";
import { FOOD_ITEMS_URL, RECIPES_URL } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api"

const mockRecipes = [
    { id: 1, title: "Salmon Alfredo", image: null, category: "Dinner" },
    { id: 2, title: "Blueberry Waffles", image: null, category: "Breakfast" },
    { id: 3, title: "Caesar Salad", image: null, category: "Lunch" },
    { id: 4, title: "Cajun Chicken and Rice", image: null, category: "Dinner" },
    { id: 5, title: "Veggie Scramble", image: null, category: "Breakfast" },
    { id: 6, title: "Grilled Cheese Sandwich", image: null, category: "Lunch" },
]

function PantryTable({ items }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                        <th className="px-3 py-2 md:px-4 md:py-3 text-left">Name</th>
                        <th className="px-3 py-2 md:px-4 md:py-3 text-left hidden md:table-cell">Brand</th>
                        <th className="px-3 py-2 md:px-4 md:py-3 text-left hidden md:table-cell">Quantity</th>
                        <th className="px-3 py-2 md:px-4 md:py-3 text-left">Category</th>
                        <th className="px-3 py-2 md:px-4 md:py-3 text-left hidden md:table-cell">Barcode</th>
                        <th className="px-3 py-2 md:px-4 md:py-3 text-left">Expiration</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-3 py-3 text-center text-gray-400">No items</td>
                        </tr>
                    ) : (
                        items.map((item) => (
                            <tr key={item.id} className={`hover:brightness-95 ${rowColor(item.expiration_date)}`}>
                                <td className="px-3 py-2 md:px-4 md:py-3 font-medium">{item.name}</td>
                                <td className="px-3 py-2 md:px-4 md:py-3 text-gray-500 hidden md:table-cell">{item.brand ?? "—"}</td>
                                <td className="px-3 py-2 md:px-4 md:py-3 text-gray-500 hidden md:table-cell">{item.quantity ?? "—"}</td>
                                <td className="px-3 py-2 md:px-4 md:py-3">{item.category ?? "—"}</td>
                                <td className="px-3 py-2 md:px-4 md:py-3 hidden md:table-cell">{item.barcode ?? "—"}</td>
                                <td className="px-3 py-2 md:px-4 md:py-3">
                                    <ExpiryBadge dateStr={item.expiration_date} />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

function Dashboard() {
    const [foodItems, setFoodItems] = useState([]);
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { token } = useAuth();

    useEffect(() => {
        async function fetchFoodItems() {
            try {
                const data = await apiFetch(FOOD_ITEMS_URL, token);
                setFoodItems(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchFoodItems();
    }, [token]);

    useEffect(() => {
        async function fetchSavedRecipes() {
            try {
                const SAVED_RECIPES_URL = RECIPES_URL.replace("/get-recipe-suggestions", "");
                const data = await apiFetch(SAVED_RECIPES_URL, token);
                setSavedRecipes(Array.isArray(data) ? data : data?.recipes || []);
            } catch (err) {
                console.error("Failed to load saved recipes", err);
            }
        }
        if (token) {
            fetchSavedRecipes();
        }
    }, [token]);

    if (loading) {
        return (
            <div className="p-6 max-w-5xl mx-auto text-center text-gray-500">
                Loading food items...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 max-w-5xl mx-auto text-center text-red-500">
                Failed to load food items: {error}
            </div>
        );
    }
    const expiringSoon = foodItems['data'].filter(item => {
        const days = daysUntilExpiry(item.expiration_date);
        return days !== null && days <= 3;
    });

    const currentItems = foodItems['data'].filter(item => {
        const days = daysUntilExpiry(item.expiration_date);
        return days === null || days > 3;
    });
    
    // Display saved recipes if available, otherwise fall back to the mock array
    const displayRecipes = savedRecipes.length > 0 ? savedRecipes : mockRecipes;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <h1 className="text-center text-2xl md:text-4xl font-semibold text-gray-900 pl-8 md:pl-0">Smart Grocery Housekeeping</h1>

            {/* Expiring Soon Table */}
            <div className="rounded-lg border border-red-400 bg-white">
                <div className="p-3 md:p-4 border-b border-red-400 bg-red-200 flex items-center justify-between gap-2">
                    <div>
                        <h2 className="text-lg md:text-2xl font-semibold text-gray-900">Expiring Soon</h2>
                        <p className="text-xs md:text-sm text-red-500">Expiring within 3 days or already expired</p>
                    </div>
                    <Link to="/all-items">
                        <Button variant="outline" size="sm">View All</Button>
                    </Link>
                </div>
                <PantryTable items={expiringSoon} />
            </div>

            {/* Current Items Table */}
            <div className="rounded-lg border bg-white">
                <div className="p-3 md:p-4 border-b bg-emerald-200 flex items-center justify-between gap-2">
                    <h2 className="text-lg md:text-2xl font-semibold text-gray-900">Current Items</h2>
                    <div className="flex gap-2 shrink-0">
                        <Link to="/additem">
                            <Button variant="outline" size="sm">Add Item</Button>
                        </Link>
                        <Link to="/all-items">
                            <Button variant="outline" size="sm">View All</Button>
                        </Link>
                    </div>
                </div>
                <PantryTable items={currentItems} />
            </div>

            {/* Recipes Section */}
            <div className="rounded-lg border bg-white">
                <div className="p-3 md:p-4 border-b bg-olive-200 flex items-center justify-between gap-2">
                    <h2 className="text-lg md:text-2xl font-semibold text-gray-900">Recipes</h2>
                    <Link to="/recipes">
                        <Button variant="outline" size="sm">View All</Button>
                    </Link>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {displayRecipes.slice(0, 3).map((recipe, index) => (
                        <Card key={recipe.title || recipe.id || index} className="relative mx-auto w-full pt-0">
                            <div className="absolute inset-0 z-30 aspect-video bg-black/10" />
                            <img
                                src={recipe.image_url ?? recipe.image ?? "https://placehold.co/640x360"}
                                alt={recipe.title}
                                className="relative z-20 aspect-video w-full object-cover"
                            />
                            <CardHeader>
                                <CardTitle className="text-sm">{recipe.title}</CardTitle>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
