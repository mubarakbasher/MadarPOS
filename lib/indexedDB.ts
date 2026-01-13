// IndexedDB utility for offline data storage in MADAR POS

const DB_NAME = 'madar_pos_db';
const DB_VERSION = 1;

// Store names
const STORES = {
    OFFLINE_SALES: 'offline_sales',
    PRODUCTS_CACHE: 'products_cache',
    INVENTORY_CACHE: 'inventory_cache',
    CUSTOMERS_CACHE: 'customers_cache',
};

// Initialize IndexedDB
export function initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            // Create object stores if they don't exist
            if (!db.objectStoreNames.contains(STORES.OFFLINE_SALES)) {
                const salesStore = db.createObjectStore(STORES.OFFLINE_SALES, {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                salesStore.createIndex('timestamp', 'timestamp', { unique: false });
                salesStore.createIndex('synced', 'synced', { unique: false });
            }

            if (!db.objectStoreNames.contains(STORES.PRODUCTS_CACHE)) {
                db.createObjectStore(STORES.PRODUCTS_CACHE, { keyPath: 'id' });
            }

            if (!db.objectStoreNames.contains(STORES.INVENTORY_CACHE)) {
                db.createObjectStore(STORES.INVENTORY_CACHE, { keyPath: 'id' });
            }

            if (!db.objectStoreNames.contains(STORES.CUSTOMERS_CACHE)) {
                db.createObjectStore(STORES.CUSTOMERS_CACHE, { keyPath: 'id' });
            }
        };
    });
}

// Generic function to add/update data
export async function setItem(storeName: string, data: any): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Generic function to get data by key
export async function getItem(storeName: string, key: any): Promise<any> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Generic function to get all data from a store
export async function getAllItems(storeName: string): Promise<any[]> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Generic function to delete data
export async function deleteItem(storeName: string, key: any): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Clear all data from a store
export async function clearStore(storeName: string): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// ===== Offline Sales Specific Functions =====

export interface OfflineSale {
    id?: number;
    items: Array<{
        product_id: number;
        quantity: number;
        unit_price: number;
    }>;
    total_amount: number;
    customer_id?: number;
    branch_id: number;
    user_id: number;
    payment_method: string;
    timestamp: Date;
    synced: boolean;
}

export async function saveOfflineSale(sale: OfflineSale): Promise<void> {
    return setItem(STORES.OFFLINE_SALES, {
        ...sale,
        timestamp: new Date(),
        synced: false,
    });
}

export async function getOfflineSales(): Promise<OfflineSale[]> {
    return getAllItems(STORES.OFFLINE_SALES);
}

export async function getUnsyncedSales(): Promise<OfflineSale[]> {
    const allSales = await getAllItems(STORES.OFFLINE_SALES);
    return allSales.filter((sale) => !sale.synced);
}

export async function markSaleAsSynced(saleId: number): Promise<void> {
    const sale = await getItem(STORES.OFFLINE_SALES, saleId);
    if (sale) {
        sale.synced = true;
        await setItem(STORES.OFFLINE_SALES, sale);
    }
}

export async function deleteOfflineSale(saleId: number): Promise<void> {
    return deleteItem(STORES.OFFLINE_SALES, saleId);
}

// ===== Products Cache Functions =====

export async function cacheProducts(products: any[]): Promise<void> {
    const db = await initDB();
    const transaction = db.transaction([STORES.PRODUCTS_CACHE], 'readwrite');
    const store = transaction.objectStore(STORES.PRODUCTS_CACHE);

    // Clear existing cache
    await store.clear();

    // Add all products
    for (const product of products) {
        await store.put(product);
    }
}

export async function getCachedProducts(): Promise<any[]> {
    return getAllItems(STORES.PRODUCTS_CACHE);
}

// ===== Inventory Cache Functions =====

export async function cacheInventory(inventory: any[]): Promise<void> {
    const db = await initDB();
    const transaction = db.transaction([STORES.INVENTORY_CACHE], 'readwrite');
    const store = transaction.objectStore(STORES.INVENTORY_CACHE);

    // Clear existing cache
    await store.clear();

    // Add all inventory items
    for (const item of inventory) {
        await store.put(item);
    }
}

export async function getCachedInventory(): Promise<any[]> {
    return getAllItems(STORES.INVENTORY_CACHE);
}

// ===== Customers Cache Functions =====

export async function cacheCustomers(customers: any[]): Promise<void> {
    const db = await initDB();
    const transaction = db.transaction([STORES.CUSTOMERS_CACHE], 'readwrite');
    const store = transaction.objectStore(STORES.CUSTOMERS_CACHE);

    // Clear existing cache
    await store.clear();

    // Add all customers
    for (const customer of customers) {
        await store.put(customer);
    }
}

export async function getCachedCustomers(): Promise<any[]> {
    return getAllItems(STORES.CUSTOMERS_CACHE);
}

// ===== Sync Functions =====

export async function syncOfflineDataToServer(): Promise<void> {
    if (!navigator.onLine) {
        console.log('Cannot sync: offline');
        return;
    }

    try {
        const unsyncedSales = await getUnsyncedSales();

        for (const sale of unsyncedSales) {
            try {
                const response = await fetch('/api/sales', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: sale.items,
                        total_amount: sale.total_amount,
                        customer_id: sale.customer_id,
                        branch_id: sale.branch_id,
                        payment_method: sale.payment_method,
                    }),
                });

                if (response.ok) {
                    if (sale.id) {
                        await markSaleAsSynced(sale.id);
                    }
                    console.log('Synced sale:', sale.id);
                } else {
                    console.error('Failed to sync sale:', sale.id, response.statusText);
                }
            } catch (error) {
                console.error('Error syncing sale:', sale.id, error);
            }
        }
    } catch (error) {
        console.error('Sync failed:', error);
    }
}

// Auto-sync when coming back online
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        console.log('Back online - starting sync...');
        syncOfflineDataToServer();
    });
}
