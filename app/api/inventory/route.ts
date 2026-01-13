
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Mark route as dynamic for Vercel deployment
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get('productId');
        const branchId = searchParams.get('branchId');

        if (productId && branchId) {
            // Get specific item stock
            const inventory = await prisma.inventory.findUnique({
                where: {
                    product_id_branch_id: {
                        product_id: parseInt(productId),
                        branch_id: parseInt(branchId)
                    }
                },
                include: {
                    product: true,
                    branch: true
                }
            });
            return NextResponse.json(inventory || { quantity: 0 }); // Return 0 if not found
        } else if (branchId) {
            // Get all stock for a branch
            const inventory = await prisma.inventory.findMany({
                where: { branch_id: parseInt(branchId) },
                include: { product: true }
            });
            return NextResponse.json(inventory);
        } else {
            // Get all inventory (limit?)
            const inventory = await prisma.inventory.findMany({
                take: 100,
                include: { product: true, branch: true }
            });
            return NextResponse.json(inventory);
        }

    } catch (error) {
        return NextResponse.json({ message: 'Failed to fetch inventory' }, { status: 500 });
    }
}