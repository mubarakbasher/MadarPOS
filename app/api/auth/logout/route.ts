
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Mark route as dynamic for Vercel deployment
export const dynamic = 'force-dynamic';
export async function POST() {
    try {
        cookies().delete('token');
        return NextResponse.json({ message: 'Logged out successfully' });
    } catch (error) {
        return NextResponse.json({ message: 'Error logging out' }, { status: 500 });
    }
}