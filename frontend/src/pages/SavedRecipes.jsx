import { useEffect, useState } from "react"
import {
    Card,
    CardAction,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/commonUI/ConfirmationModal";
import { RECIPES_URL, SAVED_RECIPES_URL, apiFetch } from "@/lib/api"
import { useAuthContext } from "@/hooks/useAuthContext"
import { deleteGuestSavedRecipes, getGuestSavedRecipes, isGuestModeEnabled } from "@/lib/guestStore"

function SavedRecipes({ refresh }) {
    const [recipes, setRecipes] = useState([]);
    const [recipeToDelete, setRecipeToDelete] = useState(null);
    const [isDeleting, setDeleting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isGuest } = useAuthContext();

    useEffect(() => {
        async function fetchSavedRecipes() {
            try {
                if (isGuest || isGuestModeEnabled()) {
                    setRecipes(await getGuestSavedRecipes());
                    return;
                }

                const GEN_RECIPES_URL = RECIPES_URL.replace("/get-recipe-suggestions", "");
                const data = await apiFetch(GEN_RECIPES_URL);
                setRecipes(Array.isArray(data) ? data : data?.recipes || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchSavedRecipes();
    }, [isGuest, refresh]);

    async function handleDeleteConfirm() {
        if (!recipeToDelete) return;
        setDeleting(true);
        try {
            if (isGuest || isGuestModeEnabled()) {
                await deleteGuestSavedRecipes(recipeToDelete.id);
            } else {
                await apiFetch(`${SAVED_RECIPES_URL}/${recipeToDelete.id}`, { method: "DELETE"});
            }
            setRecipes((prev) => prev.filter((r) => r.id !== recipeToDelete.id));
            setRecipeToDelete(null); // close dialog
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    }


    if (loading) {
        return <div className="p-6 text-center text-gray-500">Loading...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="flex w-full flex-col gap-4">
            <div className="flex flex-row justify-between p-1">
                <h2 className="text-left text-sm font-semibold text-gray-900">Saved Recipes</h2>
            </div>

            {recipes.length === 0 ? (
                <p className="text-gray-500 text-center py-10 px-6">
                    You haven't saved any recipes yet.
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    {recipes.map((recipe) => (
                        <Card key={recipe.id || recipe.name} className="relative w-full min-w-0 pt-0 overflow-hidden gap-0">
                            <div className="absolute inset-0 z-30 aspect-video bg-black/10" />
                            <img
                                src={recipe.image_url?.trim() || "https://placehold.co/640x360"}
                                alt={recipe.name}
                                className="relative z-20 aspect-video w-full object-cover"
                            />
                            <CardHeader className="min-w-0 p-2">
                                <CardAction>
                                    <Badge variant="secondary" className="text-[10px]">{recipe.category}</Badge>
                                </CardAction>
                                <CardTitle className="truncate block w-full text-xs">{recipe.name}</CardTitle>
                            </CardHeader>
                            <CardFooter className="p-4 pt-0 pb-3 gap-2 border-t-0">
                                <ConfirmationDialog
                                    open={recipeToDelete?.id === recipe.id}
                                    onOpenChange={(isOpen) => {
                                        if (!isOpen) setRecipeToDelete(null);
                                    }}
                                    trigger={
                                        <Button
                                            variant="outline"
                                            className="w-full text-red-600 hover:text-red-600"
                                            onClick={() => setRecipeToDelete(recipe)}
                                        >
                                            Delete
                                        </Button>
                                    }
                                    title={`Delete "${recipe.name}"?`}
                                    description="This will permanently remove the recipe from your app. This action cannot be undone."
                                    confirmLabel="Delete"
                                    variant="destructive"
                                    onConfirm={handleDeleteConfirm}
                                    isLoading={isDeleting}
                                />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SavedRecipes;
export const Component = SavedRecipes;