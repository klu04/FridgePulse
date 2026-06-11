// Name: Paula Tica
// Date: 4/29/2026, updated 5/21/2026
// Citation:
// Adapted code from shadcn
// Adapted code from tailwindcss
// URL: https://ui.shadcn.com/docs/components/radix/card 
// URL: https://ui.shadcn.com/colors
// URL: https://tailwindcss.com/docs/grid-template-columns 

import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RECIPES_URL, apiFetch } from "@/lib/api";
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { token } = useAuth();

    async function fetchRecipes() {
        setLoading(true);
        setError(null);
        try {
            const data = await apiFetch(RECIPES_URL, token);
            setRecipes(data.recipes || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveRecipe(recipe) {
        try {
            // RECIPES_URL points to /get-recipe-suggestions. We remove it to target the POST endpoint.
            const SAVE_RECIPE_URL = RECIPES_URL.replace("/get-recipe-suggestions", "");
            await apiFetch(SAVE_RECIPE_URL, token, {
                method: "POST",
                body: JSON.stringify(recipe),
            });
            alert("Recipe saved successfully!");
        } catch (err) {
            alert(`Failed to save recipe: ${err.message}`);
        }
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <h1 className="text-center text-4xl font-semibold text-gray-900">Recipes</h1>
            
            <div className="flex justify-center">
                <Button 
                    onClick={fetchRecipes}
                    disabled={loading}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2"
                >
                    {loading ? "Generating Recipes..." : "Get Recipe Suggestions"}
                </Button>
            </div>

            {error && (
                <div className="text-center text-red-500">Failed to load recipes: {error}</div>
            )}
            
            {!loading && !error && recipes.length === 0 && (
                <p className="text-center text-gray-500 mt-8">Click the button above to generate recipes based on your expiring items. A maximum of 6 recipes will be generated per day.</p>
            )}

            {/* Responsive grid layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe, index) => (
                    // Display a card for each recipe
                    // Each card includes an image, header, title, and footer
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
                        <CardFooter className="flex justify-between bg-neutral-200">
                            <Button 
                                type="button" 
                                variant="outline" 
                                className="bg-white 
                                text-base md:text-sm"
                                onClick={() => window.open(recipe.source_url, "_blank")}
                                >View Recipe</Button>
                            <Button 
                                type="button" 
                                onClick={() => handleSaveRecipe(recipe)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white text-base md:text-sm"
                            >
                                Save
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

        </div>
    )
}

export default Recipes