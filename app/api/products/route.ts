
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { updateInventory } from '@/lib/inventory';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';

        const products = await prisma.product.findMany({
            where: {
                name: { contains: search }
            },
            take: 20
        });

        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ message: 'Failed to fetch products' }, { status: 500 });
    }
}


export async function POST(req: Request) {
    try {
        // 1. Auth Check
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
        const {
            name, sku, categoryId, costPrice, sellingPrice,
            description, imageUrl, initialQuantity, reorderLevel
        } = body;

        // 2. Validation
        if (!name || !sku || !categoryId || !costPrice || !sellingPrice) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Check if SKU exists
        const existingProduct = await prisma.product.findUnique({ where: { sku } });
        if (existingProduct) {
            return NextResponse.json({ message: 'Product with this SKU already exists' }, { status: 409 });
        }

        // 3. Create Product
        const newProduct = await prisma.product.create({
            data: {
                name,
                sku,
                category_id: parseInt(categoryId),
                cost_price: parseFloat(costPrice),
                selling_price: parseFloat(sellingPrice),
                description,
                image_url: imageUrl,
                status: 'active'
            }
        });

        // 4. Initialize Inventory (Start with 0 then "Purchase" initial stock)
        // We'll use the main branch (ID 1) by default for now
        const mainBranchId = 1;

        // First create the inventory record with 0
        await prisma.inventory.create({
            data: {
                product_id: newProduct.product_id,
                branch_id: mainBranchId,
                quantity: 0,
                reorder_level: parseInt(reorderLevel) || 10
            }
        });

        // Then update if there is initial quantity
        if (initialQuantity && initialQuantity > 0) {
            await updateInventory(
                newProduct.product_id,
                mainBranchId,
                parseInt(initialQuantity),
                'PURCHASE', // Treating initial stock as a purchase or adjustment
                userId
            );
        }

        return NextResponse.json({
            message: 'Product created successfully',
            product: newProduct
        }, { status: 201 });

    } catch (error: any) {
        console.error('Create Product Error:', error);
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
