import { db } from '@/db/database';
import { apiFetch, FOOD_ITEMS_URL, API_BASE } from './api';

export async function syncGuestData() {
    // Sync guest data once guest makes an account
    const tables = [
        { table: db.food_items, endpoint: FOOD_ITEMS_URL },
        { table: db.recipes, endpoint: `${API_BASE}/api/v1/recipes/saved` },
        { table: db.usage_logs, endpoint: `${API_BASE}/api/v1/usage-logs` },
    ]
    for (const { table, endpoint } of tables) {
        const unsynced = await table.where('synced').equals(0).toArray()
        for (const record of unsynced) {
            try {
                await apiFetch(endpoint, { method: 'POST', body: JSON.stringify(record) })
                await table.update(record.id, { synced: 1 })
            } catch (err) {
                console.error(`Sync failed for record ${record.id}:`, err)
            }
        }
    }
}

export async function onLogout() {
    // Clear guest data when logging out
    await Promise.all([
        db.food_items.clear(),
        db.usage_logs.clear(),
        db.recipes.clear(),
    ])
}