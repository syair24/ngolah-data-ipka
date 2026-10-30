import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomUUID } from 'node:crypto';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/app/generated/prisma';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL belum diset');
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const formatDateWithDay = (dateString: string) => {
  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const ambil2Angka = (value: number) => {
  return Math.trunc(value * 100) / 100;
};

// =========================================================
// POST DATA MASUK
// =========================================================

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        {
          success: false,
          error: 'Akses ditolak. Silakan login terlebih dahulu.',
        },
        { status: 401 }
      );
    }

    const loggedInUserId = Number(sessionCookie.value);

    if (!Number.isInteger(loggedInUserId) || loggedInUserId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sesi login tidak valid.',
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const tanggal = body.date;
    const toleransi = body.tolerance;
    const data = body.data;

    if (!tanggal) {
      return NextResponse.json({ success: false, error: 'Tanggal wajib diisi.' }, { status: 400 });
    }

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Belum ada data untuk disimpan.' },
        { status: 400 }
      );
    }

    const toleransiValue = Number(String(toleransi ?? '').replace(',', '.'));

    if (!Number.isFinite(toleransiValue) || toleransiValue < 0) {
      return NextResponse.json(
        { success: false, error: 'Toleransi tidak valid.' },
        { status: 400 }
      );
    }

    const formattedDate = formatDateWithDay(String(tanggal));

    if (!formattedDate) {
      return NextResponse.json(
        { success: false, error: 'Format tanggal tidak valid.' },
        { status: 400 }
      );
    }

    // =======================================================
    // ID UNIK UNTUK SATU KALI PENYIMPANAN
    // =======================================================

    const batchId = randomUUID();

    // =======================================================
    // SIAPKAN DATA DENGAN USER ID, CATATAN, DAN BATCH ID
    // =======================================================

    const rows = data.map((item: Record<string, unknown>, index: number) => {
      const lebarMaterial = Number(String(item.materialWidth ?? '').replace(',', '.'));

      const ketebalan = Number(String(item.thickness ?? '').replace(',', '.'));

      const beratPiece = Number(String(item.pieceWeight ?? '').replace(',', '.'));

      const beratTabel = Number(String(item.tableWeight ?? '').replace(',', '.'));

      const ukuran = String(item.size ?? '')
        .toUpperCase()
        .trim();

      const catatan = String(item.catatan ?? '').trim();

      if (!Number.isFinite(lebarMaterial)) {
        throw new Error(`Lebar Material pada baris ${index + 1} tidak valid.`);
      }

      if (!Number.isFinite(ketebalan)) {
        throw new Error(`Ketebalan pada baris ${index + 1} tidak valid.`);
      }

      if (!Number.isFinite(beratPiece)) {
        throw new Error(`Berat Piece pada baris ${index + 1} tidak valid.`);
      }

      if (!Number.isFinite(beratTabel)) {
        throw new Error(`Berat Tabel pada baris ${index + 1} tidak valid.`);
      }

      if (!ukuran) {
        throw new Error(`Ukuran pada baris ${index + 1} wajib diisi.`);
      }

      const batasAtas = beratTabel + (beratTabel * toleransiValue) / 100;

      const batasBawah = beratTabel - (beratTabel * toleransiValue) / 100;

      const beratPieceCompare = ambil2Angka(beratPiece);
      const batasAtasCompare = ambil2Angka(batasAtas);
      const batasBawahCompare = ambil2Angka(batasBawah);

      let warna = 'Putih';

      if (beratPieceCompare < batasBawahCompare) {
        warna = 'Hijau';
      } else if (beratPieceCompare > batasAtasCompare) {
        warna = 'Merah';
      }

      return {
        tanggal: formattedDate,
        lebarMaterial,
        ukuran,
        ketebalan,
        beratPiece,
        beratTabel,
        toleransi: toleransiValue,
        warna,
        catatan: catatan || null,
        userId: loggedInUserId,
        batchId,
      };
    });

    // =======================================================
    // SIMPAN KE DATABASE MENGGUNAKAN TRANSACTION
    // =======================================================

    const actor = await prisma.user.findUnique({
      where: {
        id: loggedInUserId,
      },
      select: {
        id: true,
        username: true,
      },
    });

    if (!actor) {
      return NextResponse.json(
        {
          success: false,
          error: 'Pengguna tidak ditemukan. Silakan login kembali.',
        },
        { status: 401 }
      );
    }

    const savedData = await prisma.$transaction(async (tx) => {
      const createdData = [];

      for (const row of rows) {
        const item = await tx.dataPenimbangan.create({
          data: row,
        });

        createdData.push(item);
      }

      await tx.notification.create({
        data: {
          userId: actor.id,
          aksi: 'CREATE',
          judul: 'Data penimbangan ditambahkan',
          pesan: `${actor.username} menambahkan ${createdData.length} data penimbangan.`,
        },
      });

      return createdData;
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Data berhasil disimpan.',
        tanggal: formattedDate,
        batchId,
        count: savedData.length,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Gagal menyimpan data ke database.',
      },
      { status: 500 }
    );
  }
}
