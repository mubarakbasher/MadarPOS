
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT: Update customer information
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const customerId = Number(params.id);
        const body = await req.json();
        const { full_name, phone, email, address } = body;

        // Validation
        if (!full_name) {
            return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
        }

        // Update customer
        const updatedCustomer = await prisma.customer.update({
            where: { customer_id: customerId },
            data: {
                full_name,
                phone: phone || null,
                email: email || null,
                address: address || null
            }
        });

        return NextResponse.json(updatedCustomer);

    } catch (error) {
        console.error('Update customer error:', error);
        return NextResponse.json({ error: 'Error updating customer' }, { status: 500 });
    }
}
