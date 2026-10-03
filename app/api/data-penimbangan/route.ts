import { NextRequest, NextResponse } from 'next/server';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@/app/generated/prisma';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL belum diset');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

function truncateTwoDecimals(value: number): number {
  return Math.trunc(value * 100) / 100;
}

function normalizeDate(value: string): string | null {
  if (!value) return null;

  const isoMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);

  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);

    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }

    const date = new Date(year, month - 1, day);

    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const normalized = value
    .toLowerCase()
    .replace(/^[a-z]+,\s*/, '')
    .trim();

  const match = normalized.match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/);

  if (!match) return null;

  const day = Number(match[1]);
  const monthName = match[2].charAt(0).toUpperCase() + match[2].slice(1);
  const year = Number(match[3]);

  const month = MONTHS.indexOf(monthName) + 1;

  if (month < 1 || day < 1 || day > 31) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function calculateColor(
  pieceWeight: number,
  tableWeight: number,
  tolerance: number
): 'Hijau' | 'Putih' | 'Merah' {
  const upperLimit = tableWeight + (tableWeight * tolerance) / 100;

  const lowerLimit = tableWeight - (tableWeight * tolerance) / 100;

  const piece = truncateTwoDecimals(pieceWeight);
  const upper = truncateTwoDecimals(upperLimit);
  const lower = truncateTwoDecimals(lowerLimit);

  if (piece < lower) return 'Hijau';
  if (piece > upper) return 'Merah';

  return 'Putih';
}

// ==========================================
// GET DATA PENIMBANGAN
// ==========================================

export async function GET(request: NextRequest) {
  try {
    const tanggal = request.nextUrl.searchParams.get('tanggal');
    const searchTanggal = tanggal ? normalizeDate(tanggal) : null;

    if (tanggal && !searchTanggal) {
      return NextResponse.json(
        {
          success: false,
          error: 'Format tanggal tidak valid.',
        },
        { status: 400 }
      );
    }

    const databaseData = await prisma.dataPenimbangan.findMany({
      select: {
        id: true,
        tanggal: true,
        lebarMaterial: true,
        ukuran: true,
        ketebalan: true,
        beratPiece: true,
        beratTabel: true,
        toleransi: true,
        warna: true,
        dibuatPada: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: [
        {
          dibuatPada: 'desc',
        },
        {
          id: 'desc',
        },
      ],
    });

    const filteredData = searchTanggal
      ? databaseData.filter((item) => normalizeDate(item.tanggal) === searchTanggal)
      : databaseData;

    const grouped = new Map<
      string,
      {
        id: number;
        tanggal: string;
        tanggalISO: string;
        toleransi: number;
        user: {
          id: number;
          username: string;
          email: string;
        } | null;
        data: {
          id: number;
          lebarMaterial: number;
          ukuran: string;
          ketebalan: number;
          beratPiece: number;
          beratTabel: number;
          toleransi: number;
          warna: 'Hijau' | 'Putih' | 'Merah';
          dibuatPada: string;
        }[];
      }
    >();

    for (const item of filteredData) {
      const tanggalISO = normalizeDate(item.tanggal);

      if (!tanggalISO) continue;

      const lebarMaterial = Number(item.lebarMaterial);
      const ketebalan = Number(item.ketebalan);
      const beratPiece = Number(item.beratPiece);
      const beratTabel = Number(item.beratTabel);
      const toleransi = Number(item.toleransi);

      const warna = calculateColor(beratPiece, beratTabel, toleransi);

      if (!grouped.has(tanggalISO)) {
        grouped.set(tanggalISO, {
          id: item.id,
          tanggal: item.tanggal,
          tanggalISO,
          toleransi,
          user: item.user || null,
          data: [],
        });
      }

      grouped.get(tanggalISO)!.data.push({
        id: item.id,
        lebarMaterial,
        ukuran: item.ukuran,
        ketebalan,
        beratPiece,
        beratTabel,
        toleransi,
        warna,
        dibuatPada: item.dibuatPada ? item.dibuatPada.toISOString() : new Date().toISOString(),
      });
    }

    const result = Array.from(grouped.values()).sort((a, b) =>
      b.tanggalISO.localeCompare(a.tanggalISO)
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET DATA PENIMBANGAN ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Gagal memproses data.',
      },
      { status: 500 }
    );
  }
}

// ==========================================
// PUT UPDATE DATA PENIMBANGAN
// ==========================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const id = Number(body.id);
    const tanggal = String(body.tanggal ?? '').trim();
    const toleransi = Number(body.toleransi);
    const data = body.data;

    if (!Number.isInteger(id) || id <= 0 || !tanggal || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Data yang dikirim tidak lengkap atau tidak valid.',
        },
        { status: 400 }
      );
    }

    const tanggalISO = normalizeDate(tanggal);

    if (!tanggalISO) {
      return NextResponse.json(
        {
          success: false,
          error: 'Format tanggal tidak valid.',
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(toleransi) || toleransi < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nilai toleransi tidak valid.',
        },
        { status: 400 }
      );
    }

    const normalizedData = data.map((item: Record<string, unknown>) => {
      const itemId = Number(item.id);
      const lebarMaterial = Number(item.lebarMaterial);
      const ketebalan = Number(item.ketebalan);
      const beratPiece = Number(item.beratPiece);
      const beratTabel = Number(item.beratTabel);

      const ukuran = String(item.ukuran ?? '')
        .trim()
        .toUpperCase();

      return {
        id: itemId,
        lebarMaterial,
        ukuran,
        ketebalan,
        beratPiece,
        beratTabel,
        warna: calculateColor(beratPiece, beratTabel, toleransi),
      };
    });

    const hasInvalidData = normalizedData.some((item) => {
      return (
        !Number.isInteger(item.id) ||
        item.id <= 0 ||
        !item.ukuran ||
        !Number.isFinite(item.lebarMaterial) ||
        !Number.isFinite(item.ketebalan) ||
        !Number.isFinite(item.beratPiece) ||
        !Number.isFinite(item.beratTabel) ||
        item.lebarMaterial < 0 ||
        item.ketebalan < 0 ||
        item.beratPiece < 0 ||
        item.beratTabel < 0
      );
    });

    if (hasInvalidData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Terdapat nilai input yang tidak valid.',
        },
        { status: 400 }
      );
    }

    const ids = normalizedData.map((item) => item.id);

    if (new Set(ids).size !== ids.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'Terdapat ID data yang duplikat.',
        },
        { status: 400 }
      );
    }

    if (!ids.includes(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID utama tidak cocok dengan data yang dikirim.',
        },
        { status: 400 }
      );
    }

    const existingData = await prisma.dataPenimbangan.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingData.length !== ids.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sebagian data tidak ditemukan di database.',
        },
        { status: 404 }
      );
    }

    await prisma.$transaction(
      normalizedData.map((item) =>
        prisma.dataPenimbangan.update({
          where: {
            id: item.id,
          },
          data: {
            tanggal,
            toleransi,
            lebarMaterial: item.lebarMaterial,
            ukuran: item.ukuran,
            ketebalan: item.ketebalan,
            beratPiece: item.beratPiece,
            beratTabel: item.beratTabel,
            warna: item.warna,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: 'Data penimbangan berhasil diperbarui.',
    });
  } catch (error) {
    console.error('PUT DATA PENIMBANGAN ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Gagal menyimpan perubahan data.',
      },
      { status: 500 }
    );
  }
}
