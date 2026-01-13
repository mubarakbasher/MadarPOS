
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding settings...');

    const existing = await prisma.setting.findFirst();
    if (!existing) {
        await prisma.setting.create({
            data: {
                system_name: 'MADAR POS',
                currency: 'USD',
                tax_rate: 10.0,
                logo: '',
                backup_path: '/backups'
            }
        });
        console.log('Created default settings.');
    } else {
        console.log('Settings already exist.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
