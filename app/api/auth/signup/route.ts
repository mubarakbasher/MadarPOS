
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { fullName, username, email, password } = body;

        // 1. Basic Validation
        if (!fullName || !username || !email || !password) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { message: 'Password must be at least 8 characters long' },
                { status: 400 }
            );
        }

        // 2. Check for existing users
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: username }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
            }
            return NextResponse.json({ message: 'Username already taken' }, { status: 409 });
        }

        // 3. Hash Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 4. Assign Role (Default to 'Staff')
        // We try to find the role 'Staff' or 'Cashier'. If not found, maybe fallback to ID 1?
        // Let's search for 'Staff', if not found 'Cashier', if not 'Admin' (dangerous?), or just error.
        let role = await prisma.role.findUnique({ where: { role_name: 'Staff' } });
        if (!role) {
            role = await prisma.role.findUnique({ where: { role_name: 'Cashier' } });
        }

        if (!role) {
            // Fallback: get the first role available or error
            const firstRole = await prisma.role.findFirst();
            if (!firstRole) {
                return NextResponse.json({ message: 'System error: No roles defined' }, { status: 500 });
            }
            role = firstRole;
        }

        // 5. Create User
        const newUser = await prisma.user.create({
            data: {
                full_name: fullName,
                username,
                email,
                password_hash: passwordHash,
                role_id: role.role_id,
                status: 'active'
            }
        });

        return NextResponse.json(
            { message: 'User created successfully', userId: newUser.user_id },
            { status: 201 }
        );

    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
