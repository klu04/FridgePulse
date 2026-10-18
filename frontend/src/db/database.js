import Dexie from 'dexie';

export const db = new Dexie('FridgePulseDB');
db.version(2).stores({
    food_items: 'id, name, barcode, category, expiration_date, updated_at, synced',
    usage_logs: 'id, action, food_item_name, category, logged_at, updated_at, synced',
    recipes: 'id, recipe_id, updated_at, synced',
});