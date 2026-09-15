import { useState } from "react";
import RectCard from "@/components/cards/RectCard";
import DaysBadge from "@/components/cards/ExpirationBadge";
import { ItemTitle } from "@/components/ui/item";
import { ItemDetailsDialog } from "@/components/commonUI/ItemDetailsDialog";

function RecentlyAddedCard({
    item,
    badgeType = "expiring",
    isEditOpen,
    onEditOpenChange,
    onEditStart,
    onEdit,
    isSaving,
    isDeleteOpen,
    onDeleteOpenChange,
    onDeleteStart,
    onRemove,
    removing,
}) {
    const [open, setOpen] = useState(false);
    const date = badgeType === "created"
        ? (item.created_at ?? item.updated_at)
        : item.expiration_date;

    return (
        <>
            <RectCard 
                imageUrl={item.image_url} 
                alt={item.name} 
                badge={<DaysBadge date={date} mode={badgeType} />}
                onClick={() => setOpen(true)}
            >
                <ItemTitle className="text-xs md:text-sm text-center font-medium truncate block w-full">{item.name}</ItemTitle>
                <p className="text-xs md:text-sm text-center text-gray-500">Qty: {item.quantity ?? 1}</p>
            </RectCard>
            <ItemDetailsDialog
                item={item}
                open={open}
                onOpenChange={setOpen}
                isEditOpen={isEditOpen}
                onEditOpenChange={onEditOpenChange}
                onEditStart={onEditStart}
                onEdit={onEdit}
                isSaving={isSaving}
                isDeleteOpen={isDeleteOpen}
                onDeleteOpenChange={onDeleteOpenChange}
                onDeleteStart={onDeleteStart}
                onRemove={onRemove}
                removing={removing}
                showActions
            />
        </>
    );
}

export default RecentlyAddedCard;