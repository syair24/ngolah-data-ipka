import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

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

// =========================================================
// POTONG 2 ANGKA DI BELAKANG KOMA
// BUKAN PEMBULATAN
//
// 2.5480 -> 2.54
// 2.6520 -> 2.65
// 2.0930 -> 2.09
// 2.9990 -> 2.99
// =========================================================

function truncateTwoDecimals(value: number): number {
  return Math.trunc(value * 100) / 100;
}

// =========================================================
// FORMAT TANGGAL DARI DATEPICKER
//
// 2026-09-20
// menjadi:
// 20 September 2026
// =========================================================

function getSearchDate(date: string): string | null {
  const parts = date.split('-');

  if (parts.length !== 3) {
    return null;
  }

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

// =========================================================
// GET DATA PENIMBANGAN
// =========================================================

export async function GET(request: NextRequest) {
  try {
    const tanggal = request.nextUrl.searchParams.get('tanggal');

    console.log('==========================================');
    console.log('GET DATA PENIMBANGAN');
    console.log('==========================================');
    console.log('PARAMETER TANGGAL:', tanggal);

    // =======================================================
    // AMBIL SEMUA DATA LANGSUNG DARI DATABASE
    // =======================================================

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
      },

      orderBy: {
        dibuatPada: 'desc',
      },
    });

    console.log('JUMLAH DATA DARI DATABASE:', data.length);

    // =======================================================
    // DEBUG: LIHAT DATA DATABASE
    // =======================================================

    if (data.length > 0) {
      console.log(
        'DATA DATABASE:',
        data.map((item) => ({
          id: item.id,
          tanggal: item.tanggal,
          lebarMaterial: Number(item.lebarMaterial),
          ukuran: item.ukuran,
          ketebalan: Number(item.ketebalan),
          beratPiece: Number(item.beratPiece),
          beratTabel: Number(item.beratTabel),
          toleransi: Number(item.toleransi),
          warna: item.warna,
        }))
      );
    } else {
      console.log('DATABASE KOSONG: tabel DataPenimbangan tidak memiliki data.');
    }

    // =======================================================
    // FILTER TANGGAL
    // =======================================================

    let filteredData = data;

    if (tanggal) {
      const searchTanggal = getSearchDate(tanggal);

      console.log('HASIL KONVERSI TANGGAL:', searchTanggal);

      if (!searchTanggal) {
        return NextResponse.json([]);
      }

      filteredData = data.filter((item) => {
        const databaseTanggal = item.tanggal;

        console.log('BANDINGKAN:', databaseTanggal, '<->', searchTanggal);

        return databaseTanggal.includes(searchTanggal);
      });

      console.log('JUMLAH DATA SETELAH FILTER TANGGAL:', filteredData.length);
    }

    // =======================================================
    // GROUP DATA BERDASARKAN TANGGAL
    // =======================================================

    const grouped = new Map<
      string,
      {
        id: number;
        tanggal: string;
        toleransi: number;
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

    // =======================================================
    // PROSES DATA
    // =======================================================

    for (const item of filteredData) {
      const lebarMaterial = Number(item.lebarMaterial);
      const ketebalan = Number(item.ketebalan);
      const beratPiece = Number(item.beratPiece);
      const beratTabel = Number(item.beratTabel);
      const toleransi = Number(item.toleransi);

      // =====================================================
      // HITUNG BATAS TOLERANSI
      // =====================================================

      const upperLimit = beratTabel + (beratTabel * toleransi) / 100;

      const lowerLimit = beratTabel - (beratTabel * toleransi) / 100;

      // =====================================================
      // PERBANDINGAN 2 ANGKA
      // TANPA PEMBULATAN
      // =====================================================

      const pieceWeightCompare = truncateTwoDecimals(beratPiece);

      const upperLimitCompare = truncateTwoDecimals(upperLimit);

      const lowerLimitCompare = truncateTwoDecimals(lowerLimit);

      // =====================================================
      // TENTUKAN WARNA
      //
      // < batas bawah = Hijau
      // >= batas bawah dan <= batas atas = Putih
      // > batas atas = Merah
      // =====================================================

      let warna: 'Hijau' | 'Putih' | 'Merah' = 'Putih';

      if (pieceWeightCompare < lowerLimitCompare) {
        warna = 'Hijau';
      } else if (pieceWeightCompare > upperLimitCompare) {
        warna = 'Merah';
      }

      console.log('PROSES DATA:', {
        id: item.id,
        tanggal: item.tanggal,
        beratPiece,
        beratTabel,
        toleransi,
        upperLimit,
        lowerLimit,
        pieceWeightCompare,
        upperLimitCompare,
        lowerLimitCompare,
        warna,
      });

      // =====================================================
      // GROUP BERDASARKAN TANGGAL
      // =====================================================

      const tanggalKey = item.tanggal;

      if (!grouped.has(tanggalKey)) {
        grouped.set(tanggalKey, {
          id: item.id,
          tanggal: item.tanggal,
          toleransi,
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
        dibuatPada: item.dibuatPada.toISOString(),
      });
    }

    // =======================================================
    // HASIL AKHIR
    // =======================================================

    const result = Array.from(grouped.values());

    console.log('JUMLAH CARD:', result.length);
    console.log(
      'TOTAL ITEM:',
      result.reduce((total, card) => total + card.data.length, 0)
    );
    console.log('==========================================');

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET DATA PENIMBANGAN ERROR:', error);

    return NextResponse.json(
      {
        message: 'Gagal mengambil data penimbangan.',
        error: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
      }
    );
  }
}
