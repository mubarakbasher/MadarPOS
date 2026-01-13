
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            where: { status: 'active' },
            include: {
                category: true,
                inventory: {
                    where: { branch_id: 1 } // Hardcoded branch 1 for now
                }
            }
        });

        const serialized = products.map(p => ({
            ...p,
            cost_price: Number(p.cost_price),
            selling_price: Number(p.selling_price)
        }));

        return NextResponse.json(serialized);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ message: 'Failed to fetch products' }, { status: 500 });
    }
}
