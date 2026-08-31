import { useEffect, useState } from "react";
import { FOOD_ITEMS_URL, apiFetch } from "@/lib/api";
import { useAuthContext } from "@/hooks/useAuthContext";
import {
  deleteGuestFoodItem,
  getGuestFoodItems,
  isGuestModeEnabled,
  logGuestUsage,
  updateGuestFoodItem,
} from "@/lib/guestStore";
import FoodItemCard from "@/components/cards/FoodItemCard";

function Kitchen() {
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
            <FoodItemCard
              key={item.id || item.name}
              item={item}
              isEditOpen={itemToEdit?.id === item.id}
              onEditOpenChange={(isOpen) => {
                if (!isOpen) setItemToEdit(null);
              }}
              onEditStart={() => setItemToEdit(item)}
              onEdit={handleEdit}
              isSaving={isSaving && itemToEdit?.id === item.id}
              isDeleteOpen={itemToDelete?.id === item.id}
              onDeleteOpenChange={(isOpen) => {
                if (!isOpen) setItemToDelete(null);
              }}
              onDeleteStart={() => setItemToDelete(item)}
              onRemove={handleRemove}
              removing={itemToDelete?.id === item.id ? removing : false}
            />
          ))}
        </div>
      )}
    </div>
  );

}
export default Kitchen;
export const Component = Kitchen;