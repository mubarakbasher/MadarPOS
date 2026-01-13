
import { PrismaClient } from '@prisma/client';
import React from 'react';
import InventoryPageClient from './InventoryPageClient';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: {
        page?: string;
        search?: string;
        category?: string;
    }
}

async function getInventoryData(params: PageProps['searchParams']) {
    const page = Number(params.page) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;
    const search = params.search || '';
    const categoryId = params.category && params.category !== 'all' ? Number(params.category) : undefined;

    // Prisma where clause
    const where: any = {
        branch_id: 1, // Default branch
        product: {
            // Combine search conditions
            AND: [
                // Search Filter
                search ? {
                    OR: [
                        { name: { contains: search } },
                        { sku: { contains: search } }
                    ]
                } : {},
                // Category Filter
                categoryId ? { category_id: categoryId } : {}
            ]
        }
    };

    // Parallel fetch for Items, Total Count, and Categories
    const [inventory, totalCount, categories] = await Promise.all([
        prisma.inventory.findMany({
            where,
            include: {
                product: {
                    include: { category: true }
                }
            },
            orderBy: { product_id: 'desc' },
            skip,
            take: limit
        }),
        prisma.inventory.count({ where }),
        prisma.category.findMany({ orderBy: { category_name: 'asc' } })
    ]);

    // Serialize Decimal/Date types
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
        categories,
        pagination: {
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit
        }
    };
}

export default async function InventoryPage({ searchParams }: PageProps) {
    const data = await getInventoryData(searchParams);

    return (
        <InventoryPageClient
            stockItems={data.items}
            categories={data.categories}
            pagination={data.pagination}
        />
    );
}
