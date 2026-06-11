// Name: Paula Tica
// Date: 5/21/2026
// Citation:
// Adapted code from shadcn
// Adapted code from tailwindcss
// URL: https://ui.shadcn.com/docs/components/radix/card 
// URL: https://ui.shadcn.com/colors
// URL: https://tailwindcss.com/docs/grid-template-columns 

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RECIPES_URL, apiFetch } from "@/lib/api"
import { useAuth } from "@/lib/useAuth"

const mockRecipes = [
    {id: 1, title: "Salmon Alfredo", image: null},
    {id: 2, title: "Blueberry Waffles", image: null},
    {id: 3, title: "Caesar Salad", image: null},
    {id: 4, title: "Cajun Chicken and Rice", image: null},
    {id: 5, title: "Veggie Scramble", image: null},
    {id: 6, title: "Grilled Cheese Sandwich", image: null},
]

function Recipes() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { token } = useAuth();

    useEffect(() => {
        async function fetchSavedRecipes() {
            try {
                const SAVED_RECIPES_URL = RECIPES_URL.replace("/get-recipe-suggestions", "");
                const data = await apiFetch(SAVED_RECIPES_URL, token);
                
                // Set recipes, othewise defaults to empty array 
                setRecipes(Array.isArray(data) ? data : data?.recipes || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchSavedRecipes();
    }, [token]);

    if (loading) {
        return <div className="p-6 max-w-5xl mx-auto text-center text-gray-500">Loading saved recipes...</div>;
    }

    if (error) {
        return <div className="p-6 max-w-5xl mx-auto text-center text-red-500">Failed to load saved recipes: {error}</div>;
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <h1 className="text-center text-4xl font-semibold text-gray-900">Saved Recipes</h1>
            {/* Responsive grid layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center py-10">You haven't saved any recipes yet.</p>
                ) : (
                    recipes.map((recipe, index) => (
                    // card for each recipe
                    <Card key={recipe.title || index} className="relative mx-auto w-full pt-0">
                        <div className="absolute inset-0 z-30 aspect-video bg-black/10" />
                        <img
                            src={recipe.image_url ?? "https://placehold.co/640x360"}
                            alt={recipe.title}
                            className="relative z-20 aspect-video w-full object-cover"
                        />
                        <CardHeader>
                            <CardTitle>{recipe.title}</CardTitle>
                        </CardHeader>
                        <CardFooter className="flex justify-center bg-neutral-200">
                            <Button type="button" variant="outline" className="bg-white text-base md:text-sm" onClick={() => window.open(recipe.source_url, "_blank")}>View Recipe</Button>
                        </CardFooter>
                    </Card>
                )))}
            </div>

        </div>
    )
}

export default Recipes