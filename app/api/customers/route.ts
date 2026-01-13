
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        let whereClause: any = {};

        if (search) {
            whereClause = {
                OR: [
                    { full_name: { contains: search } }, // Case insensitive usually depends on DB collation
                    { phone: { contains: search } },
                    { email: { contains: search } }
                ]
            };
        }

        const customers = await prisma.customer.findMany({
            where: whereClause,
            take: 20, // Limit results
            orderBy: { full_name: 'asc' }
        });

        return NextResponse.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { full_name, phone, email, address } = body;

        if (!full_name) {
            return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
        }

        const newCustomer = await prisma.customer.create({
            data: {
                full_name,
                phone,
                email,
                address
            }
        });

        return NextResponse.json(newCustomer, { status: 201 });
    } catch (error) {
        console.error('Error creating customer:', error);
        return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
    }
}
