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

function getSearchDate(date: string): string | null {
  const parts = date.split('-');
  if (parts.length !== 3) return null;

  const [year, month, day] = parts;
  const monthNumber = Number(month);
  const dayNumber = Number(day);

  if (
    !year ||
    !month ||
    !day ||
    Number.isNaN(monthNumber) ||
    Number.isNaN(dayNumber) ||
    monthNumber < 1 ||
    monthNumber > 12 ||
    dayNumber < 1 ||
    dayNumber > 31
  ) {
    return null;
  }

  return `${dayNumber} ${MONTHS[monthNumber - 1]} ${year}`;
}

export async function GET(request: NextRequest) {
  try {
    const tanggal = request.nextUrl.searchParams.get('tanggal');

    // Ambil data penimbangan dan relasi admin usernya
    const data = await prisma.dataPenimbangan.findMany({
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
      orderBy: {
        dibuatPada: 'desc',
      },
    });

    let filteredData = data;

    if (tanggal) {
      const searchTanggal = getSearchDate(tanggal);
      if (!searchTanggal) return NextResponse.json([]);

      filteredData = data.filter((item) => item.tanggal.includes(searchTanggal));
    }

    const grouped = new Map<
      string,
      {
        id: number;
        tanggal: string;
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
          warna: string;
          dibuatPada: string;
        }[];
      }
    >();

    for (const item of filteredData) {
      const lebarMaterial = Number(item.lebarMaterial);
      const ketebalan = Number(item.ketebalan);
      const beratPiece = Number(item.beratPiece);
      const beratTabel = Number(item.beratTabel);
      const toleransi = Number(item.toleransi);

      const upperLimit = beratTabel + (beratTabel * toleransi) / 100;
      const lowerLimit = beratTabel - (beratTabel * toleransi) / 100;

      const pieceWeightCompare = truncateTwoDecimals(beratPiece);
      const upperLimitCompare = truncateTwoDecimals(upperLimit);
      const lowerLimitCompare = truncateTwoDecimals(lowerLimit);

      let warna: 'Hijau' | 'Putih' | 'Merah' = 'Putih';
      if (pieceWeightCompare < lowerLimitCompare) {
        warna = 'Hijau';
      } else if (pieceWeightCompare > upperLimitCompare) {
        warna = 'Merah';
      }

      const tanggalKey = item.tanggal;

      if (!grouped.has(tanggalKey)) {
        grouped.set(tanggalKey, {
          id: item.id,
          tanggal: item.tanggal,
          toleransi,
          user: item.user || null,
          data: [],
        });
      }

      grouped.get(tanggalKey)!.data.push({
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

    return NextResponse.json(Array.from(grouped.values()));
  } catch (error) {
    console.error('GET API ERROR:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Gagal memproses data.',
      },
      { status: 500 }
    );
  }
}
