import { NextRequest, NextResponse } from 'next/server';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/app/generated/prisma/client';

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

// =========================================================
// FORMAT TANGGAL
//
// 2026-09-20
// menjadi:
// Minggu, 20 September 2026
// =========================================================

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

// =========================================================
// POTONG 2 ANGKA DI BELAKANG KOMA
// TANPA PEMBULATAN
//
// 2.093  -> 2.09
// 2.094  -> 2.09
// 2.099  -> 2.09
// 2.4794 -> 2.47
// 2.5806 -> 2.58
// =========================================================

const ambil2Angka = (value: number) => {
  return Math.trunc(value * 100) / 100;
};

// =========================================================
// POST DATA MASUK
// =========================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('==========================================');
    console.log('POST DATA MASUK');
    console.log('BODY:', body);
    console.log('==========================================');

    const tanggal = body.date;
    const toleransi = body.tolerance;
    const data = body.data;

    // =======================================================
    // VALIDASI TANGGAL
    // =======================================================

    if (!tanggal) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tanggal wajib diisi.',
        },
        {
          status: 400,
        }
      );
    }

    // =======================================================
    // VALIDASI DATA
    // =======================================================

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Belum ada data untuk disimpan.',
        },
        {
          status: 400,
        }
      );
    }

    // =======================================================
    // VALIDASI TOLERANSI
    // =======================================================

    const toleransiValue = Number(String(toleransi ?? '').replace(',', '.'));

    if (!Number.isFinite(toleransiValue) || toleransiValue < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Toleransi tidak valid.',
        },
        {
          status: 400,
        }
      );
    }

    // =======================================================
    // FORMAT TANGGAL
    // =======================================================

    const formattedDate = formatDateWithDay(String(tanggal));

    if (!formattedDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Format tanggal tidak valid.',
        },
        {
          status: 400,
        }
      );
    }

    console.log('TANGGAL DATABASE:', formattedDate);
    console.log('TOLERANSI:', toleransiValue);
    console.log('JUMLAH BARIS:', data.length);

    // =======================================================
    // SIAPKAN DATA
    // =======================================================

    const rows = data.map((item: any, index: number) => {
      const lebarMaterial = Number(String(item.materialWidth ?? '').replace(',', '.'));

      const ketebalan = Number(String(item.thickness ?? '').replace(',', '.'));

      const beratPiece = Number(String(item.pieceWeight ?? '').replace(',', '.'));

      const beratTabel = Number(String(item.tableWeight ?? '').replace(',', '.'));

      const ukuran = String(item.size ?? '')
        .toUpperCase()
        .trim();

      // =====================================================
      // VALIDASI BARIS
      // =====================================================

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

      // =====================================================
      // HITUNG BATAS TOLERANSI
      // =====================================================

      const batasAtas = beratTabel + (beratTabel * toleransiValue) / 100;

      const batasBawah = beratTabel - (beratTabel * toleransiValue) / 100;

      // =====================================================
      // POTONG 2 ANGKA
      // TANPA PEMBULATAN
      // =====================================================

      const beratPieceCompare = ambil2Angka(beratPiece);

      const batasAtasCompare = ambil2Angka(batasAtas);

      const batasBawahCompare = ambil2Angka(batasBawah);

      // =====================================================
      // TENTUKAN WARNA
      // =====================================================

      let warna = 'Putih';

      if (beratPieceCompare < batasBawahCompare) {
        warna = 'Hijau';
      } else if (beratPieceCompare > batasAtasCompare) {
        warna = 'Merah';
      }

      console.log(`BARIS ${index + 1}:`, {
        lebarMaterial,
        ukuran,
        ketebalan,
        beratPiece,
        beratTabel,
        toleransi: toleransiValue,
        batasAtas,
        batasBawah,
        beratPieceCompare,
        batasAtasCompare,
        batasBawahCompare,
        warna,
      });

      return {
        tanggal: formattedDate,
        lebarMaterial,
        ukuran,
        ketebalan,
        beratPiece,
        beratTabel,
        toleransi: toleransiValue,
        warna,
      };
    });

    // =======================================================
    // SIMPAN KE DATABASE
    // =======================================================

    const savedData = await prisma.dataPenimbangan.createMany({
      data: rows,
    });

    console.log('==========================================');
    console.log('DATA BERHASIL DISIMPAN');
    console.log('JUMLAH:', savedData.count);
    console.log('==========================================');

    return NextResponse.json(
      {
        success: true,
        message: 'Data berhasil disimpan.',
        tanggal: formattedDate,
        count: savedData.count,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error('==========================================');
    console.error('POST /api/data-masuk ERROR');
    console.error(error);
    console.error('==========================================');

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Gagal menyimpan data ke database.',
      },
      {
        status: 500,
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
