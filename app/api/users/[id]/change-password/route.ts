
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// POST: Change user password
export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const userId = Number(params.id);
        const body = await req.json();
        const { currentPassword, newPassword } = body;

        // Validation
        if (!currentPassword || !newPassword) {
            return NextResponse.json({ message: 'Current and new password are required' }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ message: 'New password must be at least 6 characters' }, { status: 400 });
        }

        // Get user with password hash
        const user = await prisma.user.findUnique({
            where: { user_id: userId }
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValid) {
            return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.user.update({
            where: { user_id: userId },
            data: { password_hash: hashedPassword }
        });

        return NextResponse.json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json({ message: 'Error changing password' }, { status: 500 });
    }
}
