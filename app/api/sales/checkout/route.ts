
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { updateInventory } from '@/lib/inventory';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

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
        const { items, paymentMethod, subtotal, tax, discount, total, customerId } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
        }

        // 2. Process Sale Transaction
        // We use $transaction to ensure everything happens or nothing happens
        const result = await prisma.$transaction(async (tx) => {

            // A. Create Sale Record
            const sale = await tx.sale.create({
                data: {
                    user_id: userId,
                    branch_id: 1, // Hardcoded branch 1 for now
                    customer_id: customerId || null,
                    total_amount: total, // This is final total (subtotal - discount + tax)
                    discount: discount || 0, // Total discount
                    tax: tax || 0,
                    payment_method: paymentMethod || 'Cash',
                    status: 'completed',
                    sale_date: new Date(),
                    invoice_number: 'INV-' + Date.now()
                }
            });

            // B. Process Items
            for (const item of items) {
                // Check stock first (Double check inside transaction)
                const inventory = await tx.inventory.findUnique({
                    where: { product_id_branch_id: { product_id: item.productId, branch_id: 1 } } // Hardcoded branch 1
                });

                if (!inventory || inventory.quantity < item.quantity) {
                    throw new Error(`Insufficient stock for product ${item.name}`);
                }

                // Create Sale Item
                const itemSubtotal = (item.price * item.quantity) - (item.discount || 0);

                await tx.saleItem.create({
                    data: {
                        sale_id: sale.sale_id,
                        product_id: item.productId,
                        quantity: item.quantity,
                        unit_price: item.price,
                        discount: item.discount || 0,
                        subtotal: itemSubtotal
                    }
                });

                // Deduct Inventory (using Service logic manually here to be in SAME transaction)
                // Note: Our updateInventory service uses its own transaction, which might conflict if nested
                // or not participate in THIS transaction. 
                // So, we will implement the logic directly here using 'tx' to be safe.

                await tx.inventory.update({
                    where: { product_id_branch_id: { product_id: item.productId, branch_id: 1 } },
                    data: { quantity: { decrement: item.quantity } }
                });

                await tx.stockMovement.create({
                    data: {
                        product_id: item.productId,
                        branch_id: 1,
                        type: 'SALE',
                        quantity: -item.quantity,
                        reference_id: sale.sale_id,
                        user_id: userId,
                        date: new Date()
                    }
                });
            }

            return sale;
        });

        return NextResponse.json({ message: 'Sale completed successfully', saleId: result.sale_id }, { status: 201 });

    } catch (error: any) {
        console.error('Checkout error:', error);
        return NextResponse.json({ message: error.message || 'Transaction failed' }, { status: 500 });
    }
}
