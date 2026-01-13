// Custom hook for offline POS functionality
'use client';

import { useState, useEffect } from 'react';
import {
    saveOfflineSale,
    syncOfflineDataToServer,
    getUnsyncedSales,
    cacheProducts,
    getCachedProducts,
    type OfflineSale,
} from './indexedDB';

export function useOfflinePOS() {
    const [isOnline, setIsOnline] = useState(true);
    const [unsyncedCount, setUnsyncedCount] = useState(0);

    useEffect(() => {
        // Check initial online status
        setIsOnline(navigator.onLine);

        // Listen for online/offline events
        const handleOnline = () => {
            setIsOnline(true);
            syncOfflineDataToServer();
            updateUnsyncedCount();
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial update of unsynced count
        updateUnsyncedCount();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const updateUnsyncedCount = async () => {
        try {
            const unsynced = await getUnsyncedSales();
            setUnsyncedCount(unsynced.length);
        } catch (error) {
            console.error('Failed to get unsynced count:', error);
        }
    };

    const createSale = async (saleData: {
        items: Array<{ product_id: number; quantity: number; unit_price: number }>;
        total_amount: number;
        customer_id?: number;
        branch_id: number;
        user_id: number;
        payment_method: string;
    }) => {
        if (isOnline) {
            // Try to process online first
            try {
                const response = await fetch('/api/sales/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(saleData),
                });

                if (response.ok) {
                    return await response.json();
                }

                throw new Error('Online sale failed');
            } catch (error) {
                console.warn('Online sale failed, saving offline:', error);
                // Fallback to offline
                return await createOfflineSale(saleData);
            }
        } else {
            // Save offline directly
            return await createOfflineSale(saleData);
        }
    };

    const createOfflineSale = async (saleData: any) => {
        const offlineSale: OfflineSale = {
            items: saleData.items,
            total_amount: saleData.total_amount,
            customer_id: saleData.customer_id,
            branch_id: saleData.branch_id,
            user_id: saleData.user_id,
            payment_method: saleData.payment_method,
            timestamp: new Date(),
            synced: false,
        };

        await saveOfflineSale(offlineSale);
        await updateUnsyncedCount();

        return {
            success: true,
            offline: true,
            saleId: 'offline-' + Date.now(),
        };
    };

    const cacheProductData = async (products: any[]) => {
        try {
            await cacheProducts(products);
        } catch (error) {
            console.error('Failed to cache products:', error);
        }
    };

    const getCachedProductData = async () => {
        try {
            return await getCachedProducts();
        } catch (error) {
            console.error('Failed to get cached products:', error);
            return [];
        }
    };

    return {
        isOnline,
        unsyncedCount,
        createSale,
        cacheProductData,
        getCachedProductData,
        syncNow: syncOfflineDataToServer,
    };
}
