
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT: Update user information
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const userId = Number(params.id);
        const body = await req.json();
        const { fullName, email, roleId, status } = body;

        // Validation
        if (!fullName || !email || !roleId || !status) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Check if email exists for another user
        const existingUser = await prisma.user.findFirst({
            where: {
                email,
                NOT: { user_id: userId }
            }
        });

        if (existingUser) {
            return NextResponse.json({ message: 'Email already in use by another user' }, { status: 400 });
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { user_id: userId },
            data: {
                full_name: fullName,
                email,
                username: email.split('@')[0], // Update username based on email
                role_id: Number(roleId),
                status
            },
            include: {
                role: true
            }
        });

        // Remove password hash from response
        const { password_hash, ...safeUser } = updatedUser;
        return NextResponse.json(safeUser);

    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json({ message: 'Error updating user' }, { status: 500 });
    }
}
