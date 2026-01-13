
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
        sale_id: sale.sale_id,
        invoice_number: sale.invoice_number,
        sale_date: sale.sale_date.toISOString(),
        total_amount: sale.total_amount.toString(),
        payment_method: sale.payment_method || 'Cash',
        user: sale.user,
        customer: sale.customer,
        sale_items: sale.sale_items.map(item => ({
            sale_item_id: item.sale_item_id,
            product: { name: item.product.name },
            quantity: item.quantity,
            unit_price: item.unit_price.toString(),
            discount: item.discount.toString(),
            subtotal: item.subtotal.toString()
        }))
    }));

    return {
        sales: serializedSales as any,
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
