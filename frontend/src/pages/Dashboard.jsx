import { useEffect, useState } from "react";
import CardSection from "@/components/cards/CardSection";
import RecentlyAddedCard from "@/components/cards/RecentlyAddedCard";
import RecipeCard from "@/components/cards/RecipeCard";
import { daysUntilExpiration, daysSinceCreated } from "@/lib/expiry";
import { FOOD_ITEMS_URL, SAVED_RECIPES_URL, apiFetch } from "@/lib/api";
import { useAuthContext } from "@/hooks/useAuthContext";
import { getGuestFoodItems, getGuestSavedRecipes, isGuestModeEnabled } from "@/lib/guestStore";


function Dashboard() {
    const [foodItems, setFoodItems] = useState([]);
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isGuest } = useAuthContext();


    useEffect(() => {
        async function fetchFoodItems() {
            try {
                if (isGuest || isGuestModeEnabled()) {
                    const items = await getGuestFoodItems();
                    setFoodItems({ data: items });
                    return;
                }

                const data = await apiFetch(FOOD_ITEMS_URL);
                setFoodItems(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchFoodItems();
    }, [isGuest]);

    useEffect(() => {
        async function fetchSavedRecipes() {
            try {
                if (isGuest || isGuestModeEnabled()) {
                    setSavedRecipes(await getGuestSavedRecipes());
                    return;
                }

                const data = await apiFetch(SAVED_RECIPES_URL);
                setSavedRecipes(Array.isArray(data) ? data : data?.recipes || []);
            } catch (err) {
                console.error("Failed to load saved recipes", err);
            }
        }
        fetchSavedRecipes();
    }, [isGuest]);

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
        const days = daysUntilExpiration(item.expiration_date);
        return days !== null && days <= 3;
    });

    // Show items that have been recently added based on item's created date.
    const recentlyAddedItems = foodItems['data'].filter(item => {
        const days = daysSinceCreated(item.created_at ?? item.updated_at);
        return days !== null;
    });

    // Display saved recipes if available, otherwise fall back to the mock array
    const displayRecipes = savedRecipes.length > 0 ? savedRecipes : [];

    return (
        <div className="p-6 max-w-5xl md:max-w-4/5 mx-auto space-y-6">
            {/* Expiring Soon Table */}
            <CardSection
                title="Expiring Soon"
                to="/kitchen"
                isEmpty={expiringSoon.length === 0}
                emptyText="Nothing expiring soon."    
            >
                {expiringSoon.map((item) => <RecentlyAddedCard key={item.id} item={item} />)}
            </CardSection>

            {/* Recently Added Groceries Table */}
            <CardSection
                title="Recently Added"
                to="/kitchen"
                isEmpty={recentlyAddedItems.length === 0}
                emptyText="Your fridge/pantry is empty."
            >
                {recentlyAddedItems.map((item) => <RecentlyAddedCard key={item.id} item={item} badgeType="created" />)}

            </CardSection>

            {/* Recipes Section */}

            <CardSection
                title="Saved Recipes"
                to="/saved-recipes"
                isEmpty={displayRecipes.length === 0}
                emptyText="No saved recipes."
            >
                {displayRecipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe}/>)}
            </CardSection>

        </div>
    );
}

export default Dashboard;
export const Component = Dashboard;
