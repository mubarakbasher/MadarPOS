
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Mark route as dynamic for Vercel deployment
export const dynamic = 'force-dynamic';
export async function GET() {
    try {
        const branches = await prisma.branch.findMany({
            orderBy: { branch_id: 'asc' }
        });
        return NextResponse.json(branches);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { branch_name, location, phone } = body;

        if (!branch_name) {
            return NextResponse.json({ error: 'Branch name is required' }, { status: 400 });
        }

        const branch = await prisma.branch.create({
            data: {
                branch_name,
                location,
                phone,
            },
        });
        return NextResponse.json(branch, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create branch' }, { status: 500 });
    }
}