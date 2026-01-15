
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Date ranges for "Today" and "This Month"
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // 1. Total Revenue (All time)
        const revenueAgg = await prisma.sale.aggregate({
            _sum: { total_amount: true }
        });
        const totalRevenue = revenueAgg._sum.total_amount || 0;

        // 1b. Today's Revenue
        const todayRevenueAgg = await prisma.sale.aggregate({
            where: { sale_date: { gte: startOfToday } },
            _sum: { total_amount: true }
        });
        const todayRevenue = todayRevenueAgg._sum.total_amount || 0;

        // 1c. This Month's Revenue
        const monthRevenueAgg = await prisma.sale.aggregate({
            where: { sale_date: { gte: startOfMonth } },
            _sum: { total_amount: true }
        });
        const monthRevenue = monthRevenueAgg._sum.total_amount || 0;

        // 2. Total Sales Count
        const totalSales = await prisma.sale.count();

        // 2b. Today's Sales Count
        const todaySales = await prisma.sale.count({
            where: { sale_date: { gte: startOfToday } }
        });

        // 3. Low Stock Items (Items below or equal to reorder level)
        // Note: We need to filter this in JS or complex query if using SQLite where raw query might be easier,
        // but Prisma can handle this basic comparison.
        // Assuming we look at branch 1 for now or all stock.
        // Prisma `where` on relation:
        const lowStockResult = await prisma.$queryRaw<[{ count: bigint }]>`
            SELECT COUNT(*) as count FROM "Inventory" WHERE quantity <= reorder_level
        `;
        const lowStockCount = Number(lowStockResult[0]?.count || 0);

        // 4. Recent Sales (Top 5)
        const recentSales = await prisma.sale.findMany({
            take: 5,
            orderBy: { sale_date: 'desc' },
            include: {
                user: { select: { full_name: true } }
            }
        });

        const serializedRecentSales = recentSales.map(s => ({
            id: s.sale_id,
            invoice: s.invoice_number,
            user: s.user.full_name,
            total: Number(s.total_amount),
            date: s.sale_date
        }));

        return NextResponse.json({
            totalRevenue: Number(totalRevenue),
            todayRevenue: Number(todayRevenue),
            monthRevenue: Number(monthRevenue),
            totalSales,
            todaySales,
            lowStockCount,
            recentSales: serializedRecentSales
        });

    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json({ message: 'Error fetching stats' }, { status: 500 });
    }
}
