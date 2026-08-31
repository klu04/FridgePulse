import { useState } from "react";
import RectCard from "@/components/cards/RectCard";
import DaysBadge from "@/components/cards/ExpirationBadge";
import { ItemTitle } from "@/components/ui/item";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function RecentlyAddedCard({ item, badgeType = "expiring" }) {
    const [open, setOpen] = useState(false);
    const date = badgeType === "created"
        ? (item.created_at ?? item.updated_at)
        : item.expiration_date;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <RectCard 
                imageUrl={item.image_url} 
                alt={item.name} 
                badge={<DaysBadge date={date} mode={badgeType} />}
                onClick={() => setOpen(true)}
            >
                <ItemTitle className="text-xs md:text-sm text-center font-medium truncate block w-full">{item.name}</ItemTitle>
                <p className="text-xs md:text-sm text-center text-gray-500">Qty: {item.quantity ?? 1}</p>
            </RectCard>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{item.name}</DialogTitle>
                </DialogHeader>
                <img 
                    src={item.image_url ?? "http://placehold.co/640x360"} 
                    alt={item.name}
                    className="w-full rounded-md object-cover aspect-videos"
                />
                <p>Quantity: {item.quantity ?? 1}</p>
                <p>Category: {item.category}</p>
                {item.expiration_date && <p>Expiration: {item.expiration_date}</p>}
            </DialogContent>
        </Dialog>
    );
}

export default RecentlyAddedCard;