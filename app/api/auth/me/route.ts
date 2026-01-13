
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const token = cookies().get('token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        let userId: number;
        try {
            const decoded: any = jwt.verify(token, JWT_SECRET);
            userId = decoded.userId;
        } catch (e) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { user_id: userId },
            include: {
                role: true
            }
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            user_id: user.user_id,
            full_name: user.full_name,
            username: user.username,
            email: user.email,
            role: user.role.role_name
        });

    } catch (error) {
        console.error("Auth check error:", error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
