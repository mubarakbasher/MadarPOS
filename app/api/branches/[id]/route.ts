
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const branch = await prisma.branch.findUnique({
            where: { branch_id: id },
        });

        if (!branch) {
            return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
        }

        return NextResponse.json(branch);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch branch' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const body = await request.json();
        const { branch_name, location, phone } = body;

        const branch = await prisma.branch.update({
            where: { branch_id: id },
            data: {
                branch_name,
                location,
                phone,
            },
        });

        return NextResponse.json(branch);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update branch' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        // Check if branch has usage before deleting
        const hasInventory = await prisma.inventory.findFirst({ where: { branch_id: id } });
        const hasSales = await prisma.sale.findFirst({ where: { branch_id: id } });

        if (hasInventory || hasSales) {
            return NextResponse.json({ error: 'Cannot delete branch with associated inventory or history.' }, { status: 400 });
        }

        await prisma.branch.delete({
            where: { branch_id: id },
        });

        return NextResponse.json({ message: 'Branch deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete branch' }, { status: 500 });
    }
}
