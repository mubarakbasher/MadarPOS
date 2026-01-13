
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : 7;

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        // Fetch sales within range
        const sales = await prisma.sale.findMany({
            where: {
                sale_date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
                sale_date: true,
                total_amount: true
            }
        });

        // Group by Date (YYYY-MM-DD or readable format)
        const salesByDate: Record<string, number> = {};

        // Initialize all days in range with 0
        for (let d = 0; d < days; d++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + d + 1); // Start from day 1 after start
            const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // "Jan 1"
            salesByDate[key] = 0;
        }

        // Aggregate
        sales.forEach(sale => {
            const dateKey = new Date(sale.sale_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            // Note: simple grouping by user locale string. 
            // In a real app we might normalize to YYYY-MM-DD then format for display.
            // If the key doesn't exist (e.g. today after the loop ran), we'd need to handle it, 
            // but the loop covers the range mostly. Let's make it robust:

            // Re-calc key to ensure match
            if (salesByDate[dateKey] !== undefined) {
                salesByDate[dateKey] += Number(sale.total_amount);
            } else {
                // For edge cases where sale might be slightly out of the constructed loop range due to time precision
                // or if today is included/excluded slightly differently
                salesByDate[dateKey] = (salesByDate[dateKey] || 0) + Number(sale.total_amount);
            }
        });

        // Convert to Array
        const chartData = Object.keys(salesByDate).map(date => ({
            name: date,
            revenue: salesByDate[date]
        }));

        return NextResponse.json(chartData);

    } catch (error) {
        console.error("Revenue API Error:", error);
        return NextResponse.json({ message: 'Failed to fetch revenue data' }, { status: 500 });
    }
}
