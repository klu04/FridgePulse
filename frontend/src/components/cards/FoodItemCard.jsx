import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardAction,
    CardFooter,
} from "@/components/ui/card";
import { EditDialog } from "@/components/commonUI/EditDialog";
import { RemoveItemDialog } from "@/components/commonUI/RemoveItemDialog";

function FoodItemCard({
    item,
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
    return (
        <Card className="relative w-full min-w-0 pt-0 overflow-hidden gap-0">
            <div className="absolute inset-0 z-30 aspect-video bg-black/10" />
            <img
                src={item.image_url ?? "https://placehold.co/640x360"}
                alt={item.name}
                className="relative z-20 aspect-video w-full object-cover"
            />
            <CardHeader className="min-w-0 p-2">
                <CardAction>
                    <Badge variant="secondary" className="text-[10px]">{item.category}</Badge>
                </CardAction>
                <CardTitle className="truncate block w-full text-xs">{item.name}</CardTitle>
            </CardHeader>
            <CardFooter className="p-4 pt-0 pb-3 gap-2 border-t-0">
                <EditDialog
                    open={isEditOpen}
                    onOpenChange={onEditOpenChange}
                    trigger={
                        <Button variant="outline" className="flex-1" onClick={onEditStart}>
                            Edit
                        </Button>
                    }
                    title={`Edit "${item.name}"`}
                    description="Update the details for this item."
                    item={item}
                    onUpdate={onEdit}
                    isLoading={isSaving}
                />
                <RemoveItemDialog
                    open={isDeleteOpen}
                    onOpenChange={onDeleteOpenChange}
                    trigger={
                        <Button
                            variant="outline"
                            className="flex-1 text-red-600 hover:text-red-600"
                            onClick={onDeleteStart}
                        >
                            Remove
                        </Button>
                    }
                    item={item}
                    onRemove={onRemove}
                    removing={removing}
                />
            </CardFooter>
        </Card>
    );
}

export default FoodItemCard;
