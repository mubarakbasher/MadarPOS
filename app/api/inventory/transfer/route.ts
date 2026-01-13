
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { processStockMovement } from '@/lib/inventory';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fromBranchId, toBranchId, items, userId } = body;

        // Validate inputs
        if (!fromBranchId || !toBranchId || !items || !Array.isArray(items) || items.length === 0 || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (fromBranchId === toBranchId) {
            return NextResponse.json({ error: 'Source and destination branches must be different' }, { status: 400 });
        }

        // Execute transfer in a transaction
        await prisma.$transaction(async (tx) => {
            // Create a reference ID for this transfer logic (using the first movement's ID or a unique logic isn't perfect without a Transfer table)
            // Since we don't have a Transfer table yet, we'll process movements independently but within one transaction.
            // We can use the current timestamp as a loose "batch" identifier if needed, or better, just rely on the transaction.

            for (const item of items) {
                const { productId, quantity } = item;

                if (!productId || !quantity || quantity <= 0) {
                    throw new Error(`Invalid item data for product ${productId}`);
                }

                // 1. Remove from source
                await processStockMovement(
                    tx,
                    productId,
                    fromBranchId,
                    -quantity, // Negative for removal
                    'TRANSFER_OUT',
                    userId
                );

                // 2. Add to destination
                await processStockMovement(
                    tx,
                    productId,
                    toBranchId,
                    quantity, // Positive for addition
                    'TRANSFER_IN',
                    userId
                );
            }
        });

        return NextResponse.json({ message: 'Transfer successful' }, { status: 200 });

    } catch (error: any) {
        console.error("Transfer error:", error);
        return NextResponse.json({ error: error.message || 'Transfer failed' }, { status: 500 });
    }
}
