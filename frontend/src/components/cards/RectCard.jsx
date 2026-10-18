import { Item, ItemContent, ItemHeader } from "@/components/ui/item";

function RectCard({ imageUrl, alt, badge, children, onClick }) {
    return (
        <Item
            variant="outline"
            className="w-23 sm:w-26 md:w-45 flex-none min-w-0 rounded-lg overflow-hidden p-0"
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <ItemHeader className="relative m-0">
                {badge}
                <img
                    src={imageUrl?.trim() || "https://placehold.co/640x360"}
                    alt={alt}
                    className="aspect-4/5 w-full object-cover"
                />
            </ItemHeader>
            <ItemContent className="min-w-0 p-2 -mt-1 mb-1">
                {children}
            </ItemContent>
        </Item>
    );
}

export default RectCard;