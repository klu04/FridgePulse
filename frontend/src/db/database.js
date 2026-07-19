import Dexie from 'dexie';

// Create an indexedDB database for guest mode (offline use)
export class ShelfLifeDB extends Dexie {
    constructor() {
        super('ShelfLifeDB')
        this.version(1).stores({
            food_items: 'id, name, barcode, category, expiration_date, updatedAt, synced',
            usage_logs: 'id, action, food_item_name, category, logged_at, updatedAt, synced',
            recipes: 'id, recipe_id, updatedAt, synced',
        })
    }
}

export const db = new ShelfLifeDB()