
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = Number(params.id);

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const sale = await prisma.sale.findUnique({
            where: { sale_id: id },
            include: {
                sale_items: {
                    include: {
                        product: true
                    }
                },
                customer: true,
                user: true, // Cashier
                branch: true
            }
        });

        if (!sale) {
            return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
        }

        return NextResponse.json(sale);
    } catch (error) {
        console.error('Error fetching sale:', error);
        return NextResponse.json({ error: 'Failed to fetch sale' }, { status: 500 });
    }
}
