import bcrypt from 'bcrypt'
import prisma from '@/app/libs/getPrismdb'
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const body = await request.json();
    const { email, first_name, last_name, password } = body;

    // Validation
    if (!email || !first_name || !last_name || !password) {
        return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
        );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: {
            email,
            first_name,
            last_name,      
            password: hashedPassword,
            status: 'active',
        },
    });

    return NextResponse.json(user, { status: 201 });
}