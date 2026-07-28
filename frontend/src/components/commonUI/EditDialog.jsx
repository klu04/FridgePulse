import { useState } from "react";
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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const categories = [
    { label: "Dairy", value: "dairy" },
    { label: "Bakery", value: "bakery" },
    { label: "Produce", value: "produce" },
    { label: "Seafood", value: "seafood" },
    { label: "Meat", value: "meat" },
    { label: "Oils & Condiments", value: "oils & condiments" },
    { label: "Beverages", value: "beverages" },
    { label: "Snacks", value: "snacks" },
    { label: "Frozen", value: "frozen" },
    { label: "Other", value: "other" },
];

const EMPTY_FORM = {
    name: "",
    brand: "",
    quantity: "",
    barcode: "",
    category: "",
    image_url: "",
    expiration_date: "",
};

function buildFormFromItem(item) {
    return item
        ? {
            name: item.name ?? "",
            brand: item.brand ?? "",
            quantity: item.quantity ?? "",
            barcode: item.barcode ?? "",
            category: item.category ?? "",
            image_url: item.image_url ?? "",
            expiration_date: item.expiration_date ?? "",
        }
        : EMPTY_FORM;
}

export function EditDialog({
    trigger,
    title,
    description,
    variant = "default",
    item,
    onUpdate,
    open,
    onOpenChange,
    isLoading = false,
}) {
    const [form, setForm] = useState(() => buildFormFromItem(item));

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        onUpdate?.({
            ...item,
            name: form.name,
            brand: form.brand || null,
            quantity: form.quantity || null,
            barcode: form.barcode || null,
            category: form.category || null,
            image_url: form.image_url || null,
            expiration_date: form.expiration_date || null,
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <form onSubmit={handleSubmit} className="contents">
                <DialogTrigger asChild>{trigger}</DialogTrigger>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        {description && <DialogDescription>{description}</DialogDescription>}
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                maxLength={50}
                                required
                            />
                        </Field>
                        <Field>
                            <Label htmlFor="edit-brand">Brand</Label>
                            <Input
                                id="edit-brand"
                                name="brand"
                                value={form.brand}
                                onChange={handleChange}
                                maxLength={30}
                            />
                        </Field>
                        <Field>
                            <Label htmlFor="edit-quantity">Quantity</Label>
                            <Input
                                id="edit-quantity"
                                name="quantity"
                                value={form.quantity}
                                onChange={handleChange}
                                maxLength={30}
                                required
                            />
                        </Field>
                        <Field>
                            <Label htmlFor="edit-barcode">Barcode</Label>
                            <Input
                                id="edit-barcode"
                                name="barcode"
                                value={form.barcode}
                                onChange={handleChange}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={100}
                            />
                            {form.barcode && !/^\d*$/.test(form.barcode) && (
                                <p className="text-xs text-red-500">Barcode must contain only digits.</p>
                            )}
                        </Field>
                        <Field>
                            <Label htmlFor="edit-category">Category</Label>
                            <Select
                                value={form.category || undefined}
                                onValueChange={(value) =>
                                    setForm((prev) => ({ ...prev, category: value }))
                                }
                            >
                                <SelectTrigger id="edit-category" className="w-full max-w-48">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Categories</SelectLabel>
                                        {categories.map((category) => (
                                            <SelectItem key={category.value} value={category.value}>
                                                {category.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <Label htmlFor="edit-image_url">Image URL</Label>
                            <Input
                                id="edit-image_url"
                                name="image_url"
                                value={form.image_url}
                                onChange={handleChange}
                                placeholder="https://food-image.com"
                            />
                        </Field>
                        <Field>
                            <Label htmlFor="edit-expiration_date">Expiration Date</Label>
                            <Input
                                id="edit-expiration_date"
                                name="expiration_date"
                                type="date"
                                value={form.expiration_date}
                                onChange={handleChange}
                            />
                            {form.expiration_date &&
                                new Date(form.expiration_date + "T00:00:00") < new Date(new Date().toDateString()) && (
                                    <p className="text-xs text-yellow-600">This date is already expired.</p>
                                )}
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" variant={variant} disabled={isLoading}>
                            {isLoading ? "Updating..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}