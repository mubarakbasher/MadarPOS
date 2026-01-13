
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { updateInventory } from '@/lib/inventory';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function POST(req: Request) {
    try {
        // 1. Auth Check (Simplistic)
        const token = cookies().get('token')?.value;
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        let userId: number;
        try {
            const decoded: any = jwt.verify(token, JWT_SECRET);
            userId = decoded.userId;
        } catch (e) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        const body = await req.json();
        const { productId, branchId, physicalQuantity, reason } = body;

        // 2. Validate Inputs
        if (!productId || !branchId || physicalQuantity === undefined) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // 3. Get Current Stock to calculate difference
        const currentInventory = await prisma.inventory.findUnique({
            where: {
                product_id_branch_id: {
                    product_id: parseInt(productId),
                    branch_id: parseInt(branchId)
                }
            }
        });

        const currentQty = currentInventory ? currentInventory.quantity : 0;
        const diff = parseInt(physicalQuantity) - currentQty;

        if (diff === 0) {
            return NextResponse.json({ message: 'No adjustment needed (quantities match)' });
        }

        // 4. Update Inventory via Service
        // We use referenceId as null for now, or could store the adjustment log ID if we had a separate table
        await updateInventory(
            parseInt(productId),
            parseInt(branchId),
            diff,
            'ADJUSTMENT',
            userId
        );

        return NextResponse.json({
            message: 'Inventory adjusted successfully',
            previousQty: currentQty,
            newQty: physicalQuantity,
            adjustment: diff
        });

    } catch (error: any) {
        console.error('Inventory Adjustment Error:', error);
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
