
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = Number(params.id);
        if (isNaN(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });

        // 1. Auth Check
        const token = cookies().get('token')?.value;
        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        try {
            jwt.verify(token, JWT_SECRET);
        } catch (e) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        // 2. Check if product exists
        const product = await prisma.product.findUnique({
            where: { product_id: id }
        });

        if (!product) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        // 3. Delete related inventory and then the product
        // Note: In a real app, you might soft delete or check for sales history
        // For now, we'll delete inventory records first, then the product.
        // We probably also need to delete or handle sale items if they exist.
        // For simplicity, let's assume we can delete inventory.

        // Transaction to ensure cleanup
        await prisma.$transaction([
            prisma.inventory.deleteMany({ where: { product_id: id } }),
            prisma.product.delete({ where: { product_id: id } })
        ]);

        return NextResponse.json({ message: 'Product deleted successfully' });

    } catch (error: any) {
        // Handle foreign key constraint errors
        if (error.code === 'P2003') {
            return NextResponse.json({ message: 'Cannot delete product because it has associated sales records.' }, { status: 400 });
        }
        console.error('Delete Product Error:', error);
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
