import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username = body.username?.trim();
    const password = body.password;

    if (!username || !password) {
      return NextResponse.json(
        {
          message: 'Username dan password wajib diisi.',
        },
        {
          status: 400,
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: 'Username atau password salah.',
        },
        {
          status: 401,
        }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        {
          message: 'Username atau password salah.',
        },
        {
          status: 401,
        }
      );
    }

    const response = NextResponse.json(
      {
        message: 'Login berhasil.',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
      {
        status: 200,
      }
    );

    // Buat session cookie
    response.cookies.set('session', String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    return response;
  } catch (error) {
    console.error('LOGIN ERROR:', error);

    return NextResponse.json(
      {
        message: 'Terjadi kesalahan pada server.',
      },
      {
        status: 500,
      }
    );
  }
}
