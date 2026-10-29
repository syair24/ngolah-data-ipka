import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// Ambil user dari session login
async function getLoggedInUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;

  if (!session) return null;

  const userId = Number(session);

  if (!Number.isInteger(userId) || userId <= 0) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  return user;
}

// GET: Ambil daftar notifikasi
export async function GET() {
  try {
    const user = await getLoggedInUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        aksi: true,
        judul: true,
        pesan: true,
        isRead: true,
        createdAt: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error('GET NOTIFICATIONS ERROR:', error);

    return NextResponse.json(
      { success: false, error: 'Gagal mengambil notifikasi.' },
      { status: 500 }
    );
  }
}

// PATCH: Tandai notifikasi sudah dibaca
export async function PATCH(request: NextRequest) {
  try {
    const user = await getLoggedInUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { success: false, error: 'ID notifikasi tidak valid.' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notifikasi tidak ditemukan.' },
        { status: 404 }
      );
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Notifikasi ditandai sudah dibaca.',
    });
  } catch (error) {
    console.error('PATCH NOTIFICATION ERROR:', error);

    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui notifikasi.' },
      { status: 500 }
    );
  }
}

// DELETE: Hapus satu notifikasi
export async function DELETE(request: NextRequest) {
  try {
    const user = await getLoggedInUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { success: false, error: 'ID notifikasi tidak valid.' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notifikasi tidak ditemukan.' },
        { status: 404 }
      );
    }

    await prisma.notification.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Notifikasi berhasil dihapus.',
    });
  } catch (error) {
    console.error('DELETE NOTIFICATION ERROR:', error);

    return NextResponse.json(
      { success: false, error: 'Gagal menghapus notifikasi.' },
      { status: 500 }
    );
  }
}
