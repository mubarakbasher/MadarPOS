
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// GET: List all users
export async function GET() {
    try {
        const users = await prisma.user.findMany({
            include: {
                role: true
            },
            orderBy: { created_at: 'desc' }
        });

        // Remove password hash from response
        const safeUsers = users.map(user => {
            const { password_hash, ...rest } = user;
            return rest;
        });

        return NextResponse.json(safeUsers);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching users' }, { status: 500 });
    }
}

// POST: Create a new user (Restricted to Admin typically, but for now open with auth)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { fullName, email, password, roleId } = body;

        // Validation
        if (!fullName || !email || !password || !roleId) {
            return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
        }

        // Check exists
        const existing = await prisma.user.findFirst({
            where: { email }
        });

        if (existing) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create
        const user = await prisma.user.create({
            data: {
                full_name: fullName,
                email,
                username: email.split('@')[0], // Auto-generate username from email
                password_hash: hashedPassword,
                role_id: Number(roleId),
                status: 'active'
            }
        });

        const { password_hash, ...safeUser } = user;
        return NextResponse.json(safeUser, { status: 201 });

    } catch (error) {
        console.error('Create user error:', error);
        return NextResponse.json({ message: 'Error creating user' }, { status: 500 });
    }
}
