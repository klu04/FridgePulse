import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FOOD_ITEMS_URL } from "@/lib/api";
import { apiFetch } from "@/lib/api"
import { useAuthContext } from "@/hooks/useAuthContext";
import { createGuestFoodItem, isGuestModeEnabled } from "@/lib/guestStore";

const CATEGORIES = [
  "Dairy", "Bakery", "Produce", "Seafood", "Meat",
  "Oils & Condiments", "Beverages", "Snacks", "Frozen", "Other",
];

function AddItem() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isGuest } = useAuthContext();

  const prefill = useMemo(() => {
    const queryParams = new URLSearchParams(location.search);
    return {
      ...(location.state ?? {}),
      barcode: location.state?.barcode ?? queryParams.get("barcode") ?? "",
      name: location.state?.name ?? queryParams.get("name") ?? "",
      brand: location.state?.brand ?? queryParams.get("brand") ?? "",
      quantity: location.state?.quantity ?? queryParams.get("quantity") ?? "1",
      category: location.state?.category ?? queryParams.get("category") ?? "",
      image_url: location.state?.image_url ?? queryParams.get("image_url") ?? "",
    };
  }, [location.search, location.state]);

  const [form, setForm] = useState({
    name: prefill.name ?? "",
    brand: prefill.brand ?? "",
    quantity: prefill.quantity ?? "1",
    barcode: prefill.barcode ?? "",
    category: prefill.category ?? "",
    image_url: prefill.image_url ?? "",
    expiration_date: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!prefill.barcode && !prefill.name && !prefill.brand && !prefill.category && !prefill.image_url) {
      return;
    }

    setForm((current) => ({
      ...current,
      name: prefill.name || current.name,
      brand: prefill.brand || current.brand,
      quantity: prefill.quantity || current.quantity,
      barcode: prefill.barcode || current.barcode,
      category: prefill.category || current.category,
      image_url: prefill.image_url || current.image_url,
    }));
  }, [prefill]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = {
      name: form.name,
      brand: form.brand || null,
      quantity: form.quantity || null,
      barcode: form.barcode || null,
      category: form.category || null,
      image_url: form.image_url || null,
      expiration_date: form.expiration_date || null,
    };

    try {
      if (isGuest || isGuestModeEnabled()) {
        await createGuestFoodItem(payload);
      } else {
        await apiFetch(FOOD_ITEMS_URL, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-gray-700 transition-colors text-lg"
        >
          ←
        </button>
        <h1 className="text-3xl font-semibold text-gray-900">Add Food Item</h1>
      </div>

      {prefill.barcode && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Pre-filled from barcode scan. Review and confirm the details below.
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6 space-y-5">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="name">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name" name="name" type="text" required minLength={3} maxLength={255}
            value={form.name} onChange={handleChange} placeholder="e.g. Whole Milk"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="brand">Brand</label>
          <input
            id="brand" name="brand" type="text" maxLength={30}
            value={form.brand} onChange={handleChange} placeholder="e.g. Horizon Organic"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="quantity">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            id="quantity" name="quantity" type="text" required maxLength={6}
            value={form.quantity} onChange={handleChange} placeholder="1.00"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="barcode">Barcode</label>
          <input
            id="barcode" name="barcode" type="text" maxLength={100}
            inputMode="numeric" pattern="[0-9]*"
            value={form.barcode} onChange={handleChange} placeholder="e.g. 742365008412"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          {form.barcode && !/^\d*$/.test(form.barcode) && (
            <p className="text-xs text-red-500">Barcode must contain only digits.</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="category">Category</label>
          <select
            id="category" name="category" value={form.category} onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
          >
            <option value="">— Select a category —</option>
            {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="image_url">Image URL</label>
          <input
            id="image_url" name="image_url" type="text" maxLength={30}
            value={form.image_url} onChange={handleChange} placeholder="http://food-image.com"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="expiration_date">
            Expiration Date
          </label>
          <input
            id="expiration_date" name="expiration_date" type="date"
            value={form.expiration_date} onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          {form.expiration_date && new Date(form.expiration_date + "T00:00:00") < new Date(new Date().toDateString()) && (
            <p className="text-xs text-yellow-600">This date is already expired.</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={submitting} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            {submitting ? "Adding..." : "Add Item"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AddItem;
