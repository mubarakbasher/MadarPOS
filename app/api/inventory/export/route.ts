
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const categoryId = searchParams.get('category');

        // Replicate logic from page.tsx for consistency in refined export
        const where: any = {
            branch_id: 1,
            product: {
                AND: [
                    search ? {
                        OR: [
                            { name: { contains: search } }, // Add mode: 'insensitive' if Postgres
                            { sku: { contains: search } }
                        ]
                    } : {},
                    categoryId && categoryId !== 'all' ? { category_id: Number(categoryId) } : {}
                ]
            }
        };

        const inventory = await prisma.inventory.findMany({
            where,
            include: {
                product: {
                    include: { category: true }
                }
            },
            orderBy: { product_id: 'asc' } // Just consistent sorting
        });

        // Generate CSV Header
        const headers = ['Product Name', 'SKU', 'Category', 'Quantity', 'Cost Price', 'Selling Price', 'Total Value'];
        const csvRows = [headers.join(',')];

        // Generate Rows
        for (const item of inventory) {
            const cost = Number(item.product.cost_price);
            const value = cost * item.quantity;

            const row = [
                `"${item.product.name.replace(/"/g, '""')}"`, // Escape quotes
                item.product.sku,
                item.product.category.category_name,
                item.quantity,
                Number(item.product.cost_price).toFixed(2),
                Number(item.product.selling_price).toFixed(2),
                value.toFixed(2)
            ];
            csvRows.push(row.join(','));
        }

        const csvContent = csvRows.join('\n');

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename=inventory_report_${new Date().toISOString().split('T')[0]}.csv`
            }
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Failed to generate report' }, { status: 500 });
    }
}
