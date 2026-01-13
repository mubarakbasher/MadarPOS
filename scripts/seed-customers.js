
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const customers = [
        { full_name: 'John Doe', phone: '1234567890', email: 'john@example.com', address: '123 Main St' },
        { full_name: 'Jane Smith', phone: '0987654321', email: 'jane@example.com', address: '456 Oak Ave' },
        { full_name: 'Alice Johnson', phone: '5551234567', email: 'alice@example.com', address: '789 Pine Ln' },
        { full_name: 'Bob Brown', phone: '5559876543', email: 'bob@example.com', address: '321 Elm St' },
        { full_name: 'Mohammed Ali', phone: '0501234567', email: 'mohammed@example.com', address: 'Riyadh' },
    ];

    console.log('Seeding customers...');
    for (const c of customers) {
        const exists = await prisma.customer.findFirst({ where: { email: c.email } });
        if (!exists) {
            await prisma.customer.create({ data: c });
            console.log(`Created ${c.full_name}`);
        } else {
            console.log(`Skipped ${c.full_name} (already exists)`);
        }
    }
    console.log('Done.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
