import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const productId = parseInt(params.id);

        if (isNaN(productId)) {
            return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
        }

        // Fetch inventory for this product across all branches
        const branchInventory = await prisma.inventory.findMany({
            where: {
                product_id: productId,
            },
            include: {
                branch: {
                    select: {
                        branch_id: true,
                        branch_name: true,
                        location: true,
                    },
                },
            },
            orderBy: {
                branch: {
                    branch_name: 'asc',
                },
            },
        });

        // Transform the data for easier consumption
        const inventoryData = branchInventory.map((inv) => ({
            branchId: inv.branch.branch_id,
            branchName: inv.branch.branch_name,
            location: inv.branch.location,
            quantity: inv.quantity,
            reorderLevel: inv.reorder_level,
            isLowStock: inv.quantity <= inv.reorder_level,
        }));

        return NextResponse.json(inventoryData);
    } catch (error) {
        console.error('Error fetching branch inventory:', error);
        return NextResponse.json(
            { error: 'Failed to fetch branch inventory' },
            { status: 500 }
        );
    }
}
