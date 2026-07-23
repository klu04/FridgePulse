import { db } from '@/db/database'
import { GUEST_KEY } from '@/lib/auth'

function nowIso() {
    return new Date().toISOString()
}

function guestId() {
    return crypto.randomUUID()
}

export function isGuestModeEnabled() {
    return localStorage.getItem(GUEST_KEY) === 'true'
}

export async function getGuestFoodItems() {
    return db.food_items.orderBy('updated_at').reverse().toArray()
}

export async function createGuestFoodItem(payload) {
    if (payload.barcode) {
        const existing_barcode = await db.food_items.where('barcode').equals(payload.barcode).first();
        if (existing_barcode) {
            throw new Error('An item with this barcode already exists.')
        }
    }

    const item = {
        id: guestId(),
        ...payload,
        synced: 0,
        created_at: nowIso(),
        updated_at: nowIso(),
    }

    await db.food_items.put(item)
    return item
}

export async function updateGuestFoodItem(id, payload) {
    const existing = await db.food_items.get(id)
    if (!existing) throw new Error('Item not found')

    const updated = {
        ...existing,
        ...payload,
        updated_at: nowIso(),
    }

    await db.food_items.put(updated)
    return updated
}

export async function deleteGuestFoodItem(id) {
    await db.food_items.delete(id)
}

export async function logGuestUsage(item, action) {
    const entry = {
        id: guestId(),
        food_item_name: item.name,
        category: item.category ?? null,
        action,
        logged_at: nowIso(),
        synced: 0,
        updated_at: nowIso(),
    }
    await db.usage_logs.put(entry)
    return entry
}

export async function getGuestSavedRecipes() {
    return db.recipes.orderBy('updated_at').reverse().toArray()
}

export async function deleteGuestSavedRecipes(id) {
    await db.recipes.delete(id)
}

export async function saveGuestRecipe(recipe) {
    const externalId = recipe.recipe_id ?? recipe.id;

    const existing = await db.recipes.where('recipe_id').equals(externalId).first()

    const stored = {
        ...recipe,
        id: recipe.localId ?? guestId(),
        recipe_id: externalId,   // external Spoonacular ID
        synced: existing ? recipe.synced ?? 0 : 0,
        updated_at: nowIso(),
    }
    await db.recipes.put(stored)
    return stored
}

export async function getGuestReports() {
    const [foodItems, usageLogs] = await Promise.all([
        db.food_items.toArray(),
        db.usage_logs.toArray(),
    ])

    const countByAction = (action) => {
        const counts = new Map()
        for (const log of usageLogs.filter((entry) => entry.action === action)) {
            const current = counts.get(log.food_item_name) ?? { name: log.food_item_name, count: 0, unit: 'times' }
            current.count += 1
            counts.set(log.food_item_name, current)
        }
        return Array.from(counts.values())
    }

    const sortedByStaleness = [...foodItems]
        .filter((item) => item.expiration_date)
        .sort((left, right) => {
            return new Date(left.expiration_date).getTime() - new Date(right.expiration_date).getTime()
        })
        .slice(0, 6)
        .map((item) => {
            const expiration = new Date(item.expiration_date)
            const days = Math.floor((expiration.getTime() - Date.now()) / 86400000)
            return { name: item.name, count: days, unit: 'days' }
        })

    return {
        usedItems: countByAction('used'),
        unusedItems: sortedByStaleness,
        spoiledItems: countByAction('wasted'),
    }
}