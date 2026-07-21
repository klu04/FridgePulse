import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export function RemoveItemDialog({
    trigger,
    item,
    onRemove,
    open,
    onOpenChange,
    removing = false,
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Remove Item</DialogTitle>
                    <DialogDescription>
                        How would you like to remove <span className="font-medium">{item?.name}</span>?
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                    <Button
                        onClick={() => onRemove("used")}
                        disabled={!!removing}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white w-full"
                    >
                        {removing === "used" ? "Logging..." : "Mark as Used"}
                    </Button>
                    <Button
                        onClick={() => onRemove("wasted")}
                        disabled={!!removing}
                        className="bg-orange-500 hover:bg-orange-600 text-white w-full"
                    >
                        {removing === "wasted" ? "Logging..." : "Mark as Wasted"}
                    </Button>
                    <Button
                        onClick={() => onRemove("delete")}
                        disabled={!!removing}
                        variant="outline"
                        className="text-red-500 border-red-300 hover:bg-red-50 w-full"
                    >
                        {removing === "delete" ? "Deleting..." : "Just Delete"}
                    </Button>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={!!removing} className="w-full">
                            Cancel
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}