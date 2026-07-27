import RectCard from "@/components/cards/RectCard";
import DaysBadge from "@/components/cards/ExpirationBadge";
import { ItemTitle } from "@/components/ui/item";

function ProductCard({ item, badgeType = "expiring" }) {
    const date = badgeType === "created"
        ? (item.created_at ?? item.updated_at)
        : item.expiration_date;

    return (
        <RectCard imageUrl={item.image_url} alt={item.name} badge={<DaysBadge date={date} mode={badgeType} />}>
            <ItemTitle className="text-xs md:text-sm text-center font-medium truncate block w-full">{item.name}</ItemTitle>
            <p className="text-xs md:text-sm text-center text-gray-500">Qty: {item.quantity ?? 1}</p>
        </RectCard>
    );
}

export default ProductCard;