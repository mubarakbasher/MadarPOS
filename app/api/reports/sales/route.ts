
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const branchId = searchParams.get('branchId');
        const userId = searchParams.get('userId');
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

        const where: any = {};
        if (branchId) where.branch_id = parseInt(branchId);
        if (userId) where.user_id = parseInt(userId);

        // Simple fetch of recent sales with filters
        const sales = await prisma.sale.findMany({
            where: where,
            take: limit,
            orderBy: { sale_date: 'desc' },
            include: {
                user: {
                    select: { full_name: true }
                },
                branch: {
                    select: { branch_name: true }
                },
                customer: {
                    select: { full_name: true }
                },
                sale_items: {
                    include: {
                        product: { select: { name: true } }
                    }
                }
            }
        });

        // Serialize decimals
        const serialized = sales.map(sale => ({
            ...sale,
            total_amount: Number(sale.total_amount),
            sale_items: sale.sale_items.map(item => ({
                ...item,
                unit_price: Number(item.unit_price),
                subtotal: Number(item.subtotal)
            }))
        }));

        return NextResponse.json(serialized);

    } catch (error) {
        console.error("Error fetching reports:", error);
        return NextResponse.json({ message: 'Failed to fetch reports' }, { status: 500 });
    }
}
