// app/actions/getCurrentUser.ts

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/app/libs/getPrismdb';

export async function getSession() {
  return await getServerSession(authOptions);
}

export default async function getCurrentUser() {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return null;
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        user_id: true,
        email: true,
        first_name: true,
        last_name: true,
        profile_img: true,
        phone_number: true,
        date_of_birth: true,
        about: true,
        email_verified: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!currentUser) return null;

    return currentUser;
  } catch {
    return null;
  }
}