
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Mark route as dynamic for Vercel deployment
export const dynamic = 'force-dynamic';
const prisma = new PrismaClient();

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { category_name: 'asc' }
        });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ message: 'Failed to fetch categories' }, { status: 500 });
    }
}