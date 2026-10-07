import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from 'lucide-react';
import { SAVED_RECIPES_URL, RECIPES_URL, apiFetch } from "@/lib/api";
import { useState } from "react";
import SavedRecipes from "./SavedRecipes";
import { useAuthContext } from "@/hooks/useAuthContext";
import { isGuestModeEnabled, saveGuestRecipe } from "@/lib/guestStore";

function Recipes() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [savedRecipesKey, setSavedRecipesKey] = useState(0);
    const { isGuest } = useAuthContext();

    async function fetchRecipes() {
        setLoading(true);
        setError(null);
        try {
            if (isGuest || isGuestModeEnabled()) {
                setRecipes(recipes);
                return;
            }

            const data = await apiFetch(RECIPES_URL);
            setRecipes(data.recipes || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveRecipe(recipe) {
        try {
            if (isGuest || isGuestModeEnabled()) {
                await saveGuestRecipe(recipe);
            } else {
                await apiFetch(SAVED_RECIPES_URL, {
                    method: "POST",
                    body: JSON.stringify(recipe),
                });
            }
            alert("Recipe saved successfully!");
            setSavedRecipesKey(prev => prev + 1);
        } catch (err) {
            alert(`Failed to save recipe: ${err.message}`);
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <h1 className="text-left text-sm font-semibold text-gray-900 mt-2">Suggested Recipes for Expiring Items</h1>

            {error && (
                <div className="text-center text-red-500">Failed to load recipes: {error}</div>
            )}

            {!loading && !error && recipes.length === 0 && (
                <p className="text-center text-sm text-gray-500 mt-8">Click the button to generate recipes based on your expiring items. A maximum of 6 recipes will be generated per day.</p>
            )}

            <div className="flex justify-center">
                <Button
                    onClick={fetchRecipes}
                    disabled={loading}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2"
                >
                    {loading ? "Generating Recipes..." : "Get Recipe Suggestions"}
                </Button>
            </div>

            {/* Responsive grid layout */}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {recipes.map((recipe, index) => (
                    <Card key={recipe.name || index} className="relative mx-auto w-full max-w-sm pt-0">
                        <img
                            src={recipe.image_url ?? "https://placehold.co/640x360"}
                            alt={recipe.name}
                            className="relative aspect-square w-full object-cover"
                        />
                        <CardHeader className="flex flex-row items-center justify-between pr-2 md:pr-0">
                            <CardTitle className="text-xs md:text-lg truncate">
                                {recipe.name}
                            </CardTitle>
                            <Button
                                type="button"
                                variant="ghost"
                                className="shrink-0"
                                onClick={() => window.open(recipe.source_url, "_blank")}
                            ><ChevronRight className="size-5 md:size-6" /></Button>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <Button
                                type="button"
                                size="sm"
                                className="w-24 bg-emerald-500 hover:bg-emerald-600 text-white text-xs "
                                onClick={() => handleSaveRecipe(recipe)}
                            >Save</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <SavedRecipes refresh={savedRecipesKey}/>
        </div>
    )
}


export default Recipes
export const Component = Recipes;