import Dexie from 'dexie';

// Create an indexedDB database for guest mode (offline use)
export class ShelfLifeDB extends Dexie {
    constructor() {
        super('ShelfLifeDB')
        this.version(2).stores({
            food_items: 'id, name, barcode, category, expiration_date, updated_at, synced',
            usage_logs: 'id, action, food_item_name, category, logged_at, updated_at, synced',
            recipes: 'id, recipe_id, updated_at, synced',
        })
    }
}

export const db = new ShelfLifeDB()