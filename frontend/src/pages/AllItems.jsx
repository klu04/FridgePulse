import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExpiryBadge, rowColor } from "@/lib/expiry";
import { FOOD_ITEMS_URL, apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const CATEGORIES = [
  "Dairy", "Bakery", "Produce", "Seafood", "Meat",
  "Oils & Condiments", "Beverages", "Snacks", "Frozen", "Other",
];

function EditModal({ item, onClose, onSave }) {
  const [form, setForm] = useState({
    name: item.name ?? "",
    brand: item.brand ?? "",
    quantity: item.quantity ?? "",
    barcode: item.barcode ?? "",
    category: item.category ?? "",
    expiration_date: item.expiration_date ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { token } = useAuth();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      name: form.name || undefined,
      brand: form.brand || null,
      quantity: form.quantity || null,
      barcode: form.barcode || null,
      category: form.category || null,
      expiration_date: form.expiration_date || null,
    };

    try {
      const response = await apiFetch(`${FOOD_ITEMS_URL}/${item.id}`, token, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      onSave(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Edit Item</h2>

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="edit-name">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-name" name="name" type="text" required maxLength={50}
              value={form.name} onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="edit-brand">Brand</label>
            <input
              id="edit-brand" name="brand" type="text" maxLength={30}
              value={form.brand} onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="edit-quantity">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-quantity" name="quantity" type="text" required maxLength={30}
              value={form.quantity} onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="edit-barcode">Barcode</label>
            <input
              id="edit-barcode" name="barcode" type="text" maxLength={100}
              inputMode="numeric" pattern="[0-9]*"
              value={form.barcode} onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            {form.barcode && !/^\d*$/.test(form.barcode) && (
              <p className="text-xs text-red-500">Barcode must contain only digits.</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="edit-category">Category</label>
            <select
              id="edit-category" name="category" value={form.category} onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
            >
              <option value="">— Select a category —</option>
              {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="edit-expiration_date">
              Expiration Date
            </label>
            <input
              id="edit-expiration_date" name="expiration_date" type="date"
              value={form.expiration_date} onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            {form.expiration_date && new Date(form.expiration_date + "T00:00:00") < new Date(new Date().toDateString()) && (
              <p className="text-xs text-yellow-600">This date is already expired.</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={submitting} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RemoveItemModal({ item, onClose, onRemove, removing }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Remove Item</h2>
        <p className="text-sm text-gray-600">
          How would you like to remove <span className="font-medium">{item.name}</span>?
        </p>
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => onRemove("used")}
            disabled={removing}
            className="bg-emerald-500 hover:bg-emerald-600 text-white w-full"
          >
            {removing === "used" ? "Logging..." : "Mark as Used"}
          </Button>
          <Button
            onClick={() => onRemove("wasted")}
            disabled={removing}
            className="bg-orange-500 hover:bg-orange-600 text-white w-full"
          >
            {removing === "wasted" ? "Logging..." : "Mark as Wasted"}
          </Button>
          <Button
            onClick={() => onRemove("delete")}
            disabled={removing}
            variant="outline"
            className="text-red-500 border-red-300 hover:bg-red-50 w-full"
          >
            {removing === "delete" ? "Deleting..." : "Just Delete"}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={removing} className="w-full">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

function AllItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [removingItem, setRemovingItem] = useState(null);
  const [removing, setRemoving] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    async function fetchItems() {
      try {
        const data = await apiFetch(FOOD_ITEMS_URL, token);
        setItems(data['data']);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, []);

  function handleSave(updated) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setEditingItem(null);
  }

  async function handleRemove(action) {
    setRemoving(action);
    try {
      if (action === "delete") {
        await apiFetch(`${FOOD_ITEMS_URL}/${removingItem.id}`, token, { method: "DELETE" });
      } else {
        await apiFetch(`${FOOD_ITEMS_URL}/${removingItem.id}/log-usage`, token, {
          method: "POST",
          body: JSON.stringify({ action }),
        });
      }
      setItems((prev) => prev.filter((i) => i.id !== removingItem.id));
      setRemovingItem(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setRemoving(false);
    }
  }

  if (loading) return <div className="p-6 text-center text-gray-500">Loading items...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Failed to load items: {error}</div>;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 pl-12 md:pl-0">All Food Items</h1>

      <div className="rounded-lg border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-3 py-2 md:px-4 md:py-3 text-left">Name</th>
              <th className="px-3 py-2 md:px-4 md:py-3 text-left hidden md:table-cell">Brand</th>
              <th className="px-3 py-2 md:px-4 md:py-3 text-left hidden md:table-cell">Quantity</th>
              <th className="px-3 py-2 md:px-4 md:py-3 text-left hidden sm:table-cell">Category</th>
              <th className="px-3 py-2 md:px-4 md:py-3 text-left hidden md:table-cell">Barcode</th>
              <th className="px-3 py-2 md:px-4 md:py-3 text-left">Expiration</th>
              <th className="px-3 py-2 md:px-4 md:py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">No items found.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className={`hover:brightness-95 ${rowColor(item.expiration_date)}`}>
                  <td className="px-3 py-2 md:px-4 md:py-3 font-medium">{item.name}</td>
                  <td className="px-3 py-2 md:px-4 md:py-3 text-gray-500 hidden md:table-cell">{item.brand ?? "—"}</td>
                  <td className="px-3 py-2 md:px-4 md:py-3 font-medium hidden md:table-cell">{item.quantity}</td>
                  <td className="px-3 py-2 md:px-4 md:py-3 hidden sm:table-cell">{item.category ?? "—"}</td>
                  <td className="px-3 py-2 md:px-4 md:py-3 hidden md:table-cell">{item.barcode ?? "—"}</td>
                  <td className="px-3 py-2 md:px-4 md:py-3"><ExpiryBadge dateStr={item.expiration_date} /></td>
                  <td className="px-3 py-2 md:px-4 md:py-3">
                    <div className="flex flex-col md:flex-row gap-1 md:gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingItem(item)}>Edit</Button>
                      <Button
                        size="sm" variant="outline"
                        className="text-red-500 border-red-300 hover:bg-red-50"
                        onClick={() => setRemovingItem(item)}
                      >
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingItem && (
        <EditModal item={editingItem} onClose={() => setEditingItem(null)} onSave={handleSave} />
      )}
      {removingItem && (
        <RemoveItemModal
          item={removingItem}
          onClose={() => setRemovingItem(null)}
          onRemove={handleRemove}
          removing={removing}
        />
      )}
    </div>
  );
}

export default AllItems;
