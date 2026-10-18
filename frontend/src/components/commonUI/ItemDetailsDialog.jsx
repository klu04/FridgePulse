import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { EditDialog } from "@/components/commonUI/EditDialog";
import { RemoveItemDialog } from "@/components/commonUI/RemoveItemDialog";

export function ItemDetailsDialog({
    item,
    open,
    onOpenChange,
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
    showActions = false,
}) {
    const canEdit = showActions && onEdit && onEditOpenChange;
    const canRemove = showActions && onRemove && onDeleteOpenChange;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{item.name}</DialogTitle>
                </DialogHeader>
                <img
                    src={item.image_url?.trim() || "https://placehold.co/640x360"}
                    alt={item.name}
                    className="w-full rounded-md object-cover aspect-video"
                />
                <p>Category: {item.category}</p>
                <p>Quantity: {item.quantity ?? 1}</p>
                {item.expiration_date && <p>Expiration: {item.expiration_date}</p>}
                {(canEdit || canRemove) && (
                    <div className="flex gap-2">
                        {canEdit && (
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
                        )}
                        {canRemove && (
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
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}