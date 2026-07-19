import RectCard from "@/components/cards/RectCard";
import { ItemTitle } from '@/components/ui/item';

function RecipeCard({ recipe }) {
    return (
        <RectCard imageUrl={recipe.image_url} alt={recipe.name}>
            <ItemTitle className="text-xs md:text-sm text-center font-medium truncate block w-full">{recipe.name}</ItemTitle>
        </RectCard>
    )
}

export default RecipeCard;