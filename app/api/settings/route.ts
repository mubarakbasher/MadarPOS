
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Mark route as dynamic for Vercel deployment
export const dynamic = 'force-dynamic';
const prisma = new PrismaClient();

// GET: Fetch current settings
export async function GET() {
    try {
        let settings = await prisma.setting.findFirst();

        // Return defaults if not found (though seed should handle this)
        if (!settings) {
            return NextResponse.json({
                system_name: 'MADAR POS',
                currency: 'USD',
                tax_rate: 0
            });
        }

        return NextResponse.json({
            ...settings,
            tax_rate: Number(settings.tax_rate)
        });
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json({ message: 'Failed to fetch settings' }, { status: 500 });
    }
}

// PUT: Update settings
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { systemName, currency, taxRate } = body;

        // Validations
        if (!systemName) {
            return NextResponse.json({ message: 'System name is required' }, { status: 400 });
        }

        // Update or Create the single row
        const first = await prisma.setting.findFirst();

        let updated;
        if (first) {
            updated = await prisma.setting.update({
                where: { setting_id: first.setting_id },
                data: {
                    system_name: systemName,
                    currency,
                    tax_rate: taxRate
                }
            });
        } else {
            updated = await prisma.setting.create({
                data: {
                    system_name: systemName,
                    currency,
                    tax_rate: taxRate
                }
            });
        }

        return NextResponse.json({
            ...updated,
            tax_rate: Number(updated.tax_rate)
        });

    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json({ message: 'Failed to update settings' }, { status: 500 });
    }
}