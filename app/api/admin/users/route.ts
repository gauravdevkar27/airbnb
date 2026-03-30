// app/api/admin/users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { adminOnly } from '@/app/libs/WithRole';
import prisma from '@/app/libs/getPrismdb';

// ── GET /api/admin/users — list all users (admin only) ────────────────────────
export const GET = adminOnly(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  const page     = Number(searchParams.get('page')   ?? 1);
  const limit    = Number(searchParams.get('limit')  ?? 20);
  const status   = searchParams.get('status');   // filter by status
  const role     = searchParams.get('role');     // filter by role
  const search   = searchParams.get('search');   // search by name/email

  const where: any = {};
  if (status) where.status = status;
  if (role)   where.role   = role;
  if (search) {
    where.OR = [
      { email:      { contains: search, mode: 'insensitive' } },
      { first_name: { contains: search, mode: 'insensitive' } },
      { last_name:  { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        user_id:        true,
        email:          true,
        first_name:     true,
        last_name:      true,
        role:           true,
        status:         true,
        email_verified: true,
        phone_number:   true,
        created_at:     true,
      },
      orderBy: { created_at: 'desc' },
      skip:  (page - 1) * limit,
      take:  limit,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});


// ── PATCH /api/admin/users — update role or status of a user ──────────────────
export const PATCH = adminOnly(async (req: NextRequest) => {
  const body = await req.json();
  const { user_id, role, status } = body;

  if (!user_id) {
    return NextResponse.json({ error: 'user_id is required.' }, { status: 400 });
  }

  // Must provide at least one field to update
  if (!role && !status) {
    return NextResponse.json(
      { error: 'Provide at least role or status to update.' },
      { status: 400 }
    );
  }

  // Validate values
  if (role && !['user', 'admin'].includes(role)) {
    return NextResponse.json(
      { error: 'role must be "user" or "admin".' },
      { status: 400 }
    );
  }
  if (status && !['active', 'inactive', 'banned'].includes(status)) {
    return NextResponse.json(
      { error: 'status must be "active", "inactive", or "banned".' },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { user_id: String(user_id) },
    data: {
      ...(role   && { role }),
      ...(status && { status }),
    },
    select: {
      user_id:    true,
      email:      true,
      first_name: true,
      last_name:  true,
      role:       true,
      status:     true,
    },
  });

  return NextResponse.json({ message: 'User updated.', user: updated });
});