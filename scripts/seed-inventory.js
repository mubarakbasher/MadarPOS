
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Create Default Branch
    const mainBranch = await prisma.branch.upsert({
        where: { branch_id: 1 },
        update: {},
        create: {
            branch_name: 'Main Headquarters',
            location: 'New York, USA',
            phone: '123-456-7890'
        }
    });

    // 2. Create Default Categories
    const categories = ['Electronics', 'Clothing', 'Groceries', 'Furniture'];
    for (const name of categories) {
        await prisma.category.create({
            data: {
                category_name: name,
                description: `General ${name} items`
            }
        });
    }

    // 3. Create Sample Products & Initial Stock (via Inventory)
    // We can't use the 'updateInventory' service easily here because it's TS and this is a JS script, 
    // so we'll just insert raw data for seeding.

    const electronicsCat = await prisma.category.findFirst({ where: { category_name: 'Electronics' } });

    const laptop = await prisma.product.create({
        data: {
            name: 'Pro Laptop 15"',
            sku: 'LP-15-PRO',
            category_id: electronicsCat.category_id,
            cost_price: 800.00,
            selling_price: 1200.00,
            status: 'active'
        }
    });

    await prisma.inventory.create({
        data: {
            product_id: laptop.product_id,
            branch_id: mainBranch.branch_id,
            quantity: 50,
            reorder_level: 10
        }
    });

    console.log('Seeding completed: Branch, Categories, and Products created.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
