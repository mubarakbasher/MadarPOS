
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const roles = ['Admin', 'Manager', 'Cashier', 'Staff'];

    for (const roleName of roles) {
        const role = await prisma.role.upsert({
            where: { role_name: roleName },
            update: {},
            create: {
                role_name: roleName,
                description: `Role for ${roleName}`,
            },
        });
        console.log(`Role ensured: ${role.role_name}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
