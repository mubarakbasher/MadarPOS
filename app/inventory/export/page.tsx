
import { PrismaClient } from '@prisma/client';
import React from 'react';
import InventoryExportClient from './InventoryExportClient';

const prisma = new PrismaClient();

interface PageProps {
    searchParams: {
        search?: string;
        category?: string;
    }
}

async function getInventoryData(params: PageProps['searchParams']) {
    const search = params.search || '';
    const categoryId = params.category && params.category !== 'all' ? Number(params.category) : undefined;

    // Build where clause
    const where: any = {
        branch_id: 1, // Default branch
        product: {
            AND: [
                search ? {
                    OR: [
                        { name: { contains: search } },
                        { sku: { contains: search } }
                    ]
                } : {},
                categoryId ? { category_id: categoryId } : {}
            ]
        }
    };

    // Fetch inventory data and settings
    const [inventory, settings, categories] = await Promise.all([
        prisma.inventory.findMany({
            where,
            include: {
                product: {
                    include: { category: true }
                },
                branch: true
            },
            orderBy: { product_id: 'asc' }
        }),
        prisma.setting.findFirst(),
        prisma.category.findMany({ orderBy: { category_name: 'asc' } })
    ]);

    // Calculate statistics
    const totalProducts = inventory.length;
    const lowStockItems = inventory.filter(item => item.quantity <= item.reorder_level).length;
    const totalValue = inventory.reduce((acc, item) => acc + (Number(item.product.cost_price) * item.quantity), 0);

    // Serialize data
    const serializedInventory = inventory.map(item => ({
        ...item,
        product: {
            ...item.product,
            cost_price: item.product.cost_price.toString(),
            selling_price: item.product.selling_price.toString()
        }
    }));

    return {
        items: serializedInventory,
        settings: settings || { system_name: 'MADAR POS', currency: 'USD' },
        categories,
        filters: {
            search,
            categoryId,
            categoryName: categoryId ? categories.find(c => c.category_id === categoryId)?.category_name : null
        },
        stats: {
            totalProducts,
            lowStockItems,
            totalValue
        }
    };
}

export default async function InventoryExportPage({ searchParams }: PageProps) {
    const data = await getInventoryData(searchParams);

    return <InventoryExportClient data={data} />;
}
