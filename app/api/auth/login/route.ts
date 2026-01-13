
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

// Mark this route as dynamic since it uses cookies
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { identifier, password } = body;

        // 1. Basic Validation
        if (!identifier || !password) {
            return NextResponse.json(
                { message: 'Email/Username and Password are required' },
                { status: 400 }
            );
        }

        // 2. Find User (by email or username)
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { username: identifier }
                ]
            },
            include: {
                role: true // include role info
            }
        });

        if (!user) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // 3. Verify Password
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // 4. Check Status
        if (user.status !== 'active') {
            return NextResponse.json(
                { message: 'Account is disabled. Contact administrator.' },
                { status: 403 }
            );
        }

        // 5. Generate JWT Token
        // Payload contains essential user info
        const token = jwt.sign(
            {
                userId: user.user_id,
                email: user.email,
                role: user.role.role_name,
                fullName: user.full_name
            },
            JWT_SECRET,
            { expiresIn: '8h' } // Token valid for 8 hours (typical work shift)
        );

        // 6. Set Secure Cookie
        // Using Next.js cookies API to set HTTP-only cookie
        cookies().set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 8, // 8 hours in seconds
            path: '/',
        });

        // 7. Return Success
        return NextResponse.json(
            {
                message: 'Login successful',
                user: {
                    id: user.user_id,
                    name: user.full_name,
                    role: user.role.role_name
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
