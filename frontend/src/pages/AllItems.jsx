import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
import { FOOD_ITEMS_URL, apiFetch } from "@/lib/api";
import { useAuthContext } from "@/hooks/useAuthContext";
import {
  deleteGuestFoodItem,
  getGuestFoodItems,
  isGuestModeEnabled,
  logGuestUsage,
  updateGuestFoodItem,
} from "@/lib/guestStore";
import { EditDialog } from "@/components/commonUI/EditDialog";
import { RemoveItemDialog } from "@/components/commonUI/RemoveItemDialog";

function AllItems() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);
  const { isGuest } = useAuthContext();


  useEffect(() => {
    async function fetchItems() {
      try {
        if (isGuest || isGuestModeEnabled()) {
          setItems(await getGuestFoodItems());
          return;
        }

        const data = await apiFetch(FOOD_ITEMS_URL);
        console.log(data['data']);
        setItems(data['data']);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, [isGuest]);

  async function handleEdit(updated) {
    setSaving(true);
    try {
      const payload = {
        name: updated.name || undefined,
        brand: updated.brand,
        quantity: updated.quantity,
        barcode: updated.barcode,
        category: updated.category,
        image_url: updated.image_url,
        expiration_date: updated.expiration_date,
      };

      const saved =
        isGuest || isGuestModeEnabled()
          ? await updateGuestFoodItem(itemToEdit.id, payload)
          : await apiFetch(`${FOOD_ITEMS_URL}/${itemToEdit.id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          });

      setItems((prev) =>
        prev.map((i) => (i.id === itemToEdit.id ? { ...i, ...saved } : i))
      );
      setItemToEdit(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }


  async function handleRemove(action) {
    setRemoving(action);
    try {
      if (action === "delete") {
        if (isGuest || isGuestModeEnabled()) {
          await deleteGuestFoodItem(itemToDelete.id);
        } else {
          await apiFetch(`${FOOD_ITEMS_URL}/${itemToDelete.id}`, { method: "DELETE" });
        }
      } else {
        if (isGuest || isGuestModeEnabled()) {
          await logGuestUsage(itemToDelete, action);
        } else {
          await apiFetch(`${FOOD_ITEMS_URL}/${itemToDelete.id}/log-usage`, {
            method: "POST",
            body: JSON.stringify({ action }),
          });
        }
      }
      setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      setItemToDelete(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setRemoving(false);
    }
  }

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-row justify-between p-1">
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-10 px-6">
          You haven't saved any items yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {items.map((item) => (
            <Card key={item.id || item.name} className="relative w-full min-w-0 pt-0 overflow-hidden gap-0">
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
                  open={itemToEdit?.id === item.id}
                  onOpenChange={(isOpen) => {
                    if (!isOpen) setItemToEdit(null);
                  }}
                  trigger={
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setItemToEdit(item)}
                    >
                      Edit
                    </Button>
                  }
                  title={`Edit "${item.name}"`}
                  description="Update the details for this item."
                  item={itemToEdit?.id === item.id ? itemToEdit : item}
                  onUpdate={handleEdit}
                  isLoading={isSaving && itemToEdit?.id === item.id}
                />
                <RemoveItemDialog
                  open={itemToDelete?.id === item.id}
                  onOpenChange={(isOpen) => {
                    if (!isOpen) setItemToDelete(null);
                  }}
                  trigger={
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600 hover:text-red-600"
                      onClick={() => setItemToDelete(item)}
                    >
                      Remove
                    </Button>
                  }
                  item={itemToDelete}
                  onRemove={handleRemove}
                  removing={itemToDelete?.id === item.id ? removing : false}
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

}
export default AllItems;