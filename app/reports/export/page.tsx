
import { PrismaClient } from '@prisma/client';
import React from 'react';
import SalesExportClient from './SalesExportClient';

const prisma = new PrismaClient();

interface PageProps {
    searchParams: {
        userId?: string;
    }
}

async function getSalesData(params: PageProps['searchParams']) {
    const userId = params.userId ? Number(params.userId) : undefined;

    const where: any = {};
    if (userId) where.user_id = userId;

    // Fetch sales data and settings
    const [sales, settings, cashier] = await Promise.all([
        prisma.sale.findMany({
            where,
            orderBy: { sale_date: 'desc' },
            include: {
                user: { select: { full_name: true } },
                customer: { select: { full_name: true } },
                branch: { select: { branch_name: true } },
                sale_items: {
                    include: {
                        product: { select: { name: true } }
                    }
                }
            }
        }),
        prisma.setting.findFirst(),
        userId ? prisma.user.findUnique({
            where: { user_id: userId },
            select: { full_name: true }
        }) : null
    ]);

    // Calculate statistics
    const totalRevenue = sales.reduce((acc, sale) => acc + Number(sale.total_amount), 0);
    const totalTransactions = sales.length;
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Serialize data
    const serializedSales = sales.map(sale => ({
        ...sale,
        total_amount: sale.total_amount.toString(),
        discount: sale.discount.toString(),
        tax: sale.tax.toString(),
        sale_items: sale.sale_items.map(item => ({
            ...item,
            unit_price: item.unit_price.toString(),
            subtotal: item.subtotal.toString()
        }))
    }));

    return {
        sales: serializedSales,
        settings: settings || { system_name: 'MADAR POS', currency: 'USD' },
        cashierFilter: cashier,
        stats: {
            totalRevenue,
            totalTransactions,
            avgTransaction
        }
    };
}

export default async function SalesExportPage({ searchParams }: PageProps) {
    const data = await getSalesData(searchParams);

    return <SalesExportClient data={data} />;
}
