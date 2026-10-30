import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/app/generated/prisma';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL belum diset');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ==========================================
// MEMBUAT NOTIFIKASI AKTIVITAS
// ==========================================

async function createActivityNotification(
  aksi: 'CREATE' | 'UPDATE' | 'DELETE',
  judul: string,
  pesan: string
) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    const userId = Number(session);

    if (!session || !Number.isInteger(userId) || userId <= 0) {
      console.error('Notifikasi tidak dibuat: session tidak valid.');
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      console.error('Notifikasi tidak dibuat: user tidak ditemukan.');
      return;
    }

    await prisma.notification.create({
      data: {
        userId: user.id,
        aksi,
        judul,
        pesan,
      },
    });
  } catch (error) {
    console.error('GAGAL MEMBUAT NOTIFIKASI:', error);
  }
}

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

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDateLongForMessage(value: string): string {
  const normalized = normalizeDate(value);

  if (!normalized) return value;

  const [year, month, day] = normalized.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day), 12);

  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
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
        batchId: true,
        tanggal: true,
        lebarMaterial: true,
        ukuran: true,
        ketebalan: true,
        beratPiece: true,
        beratTabel: true,
        toleransi: true,
        warna: true,
        catatan: true,
        dibuatPada: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: [{ dibuatPada: 'desc' }, { id: 'desc' }],
    });

    const filteredData = searchTanggal
      ? databaseData.filter((item) => normalizeDate(item.tanggal) === searchTanggal)
      : databaseData;

    type GroupedItem = {
      id: number;
      lebarMaterial: number;
      ukuran: string;
      ketebalan: number;
      beratPiece: number;
      beratTabel: number;
      toleransi: number;
      warna: 'Hijau' | 'Putih' | 'Merah';
      catatan: string | null;
      dibuatPada: string;
      batchId: string | null;
    };

    type GroupedData = {
      id: number;
      batchId: string | null;
      tanggal: string;
      tanggalISO: string;
      toleransi: number;
      user: {
        id: number;
        username: string;
        email: string;
      } | null;
      data: GroupedItem[];
      latestTime: number;
    };

    const grouped = new Map<string, GroupedData>();

    for (const item of filteredData) {
      const tanggalISO = normalizeDate(item.tanggal);

      if (!tanggalISO) continue;

      const lebarMaterial = Number(item.lebarMaterial);
      const ketebalan = Number(item.ketebalan);
      const beratPiece = Number(item.beratPiece);
      const beratTabel = Number(item.beratTabel);
      const toleransi = Number(item.toleransi);

      const warna = calculateColor(beratPiece, beratTabel, toleransi);

      // Setiap batchId menjadi satu kelompok tersendiri.
      // Data lama tanpa batchId menggunakan kelompok berdasarkan tanggal.
      const groupKey = item.batchId ? `batch:${item.batchId}` : `legacy:${tanggalISO}`;

      const dibuatPada = item.dibuatPada ? item.dibuatPada.toISOString() : new Date().toISOString();

      const createdTime = new Date(dibuatPada).getTime();

      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, {
          id: item.id,
          batchId: item.batchId ?? null,
          tanggal: formatDateLongForMessage(tanggalISO),
          tanggalISO,
          toleransi,
          user: item.user || null,
          data: [],
          latestTime: Number.isFinite(createdTime) ? createdTime : 0,
        });
      }

      const group = grouped.get(groupKey)!;

      if (Number.isFinite(createdTime) && createdTime > group.latestTime) {
        group.latestTime = createdTime;
      }

      group.data.push({
        id: item.id,
        lebarMaterial,
        ukuran: item.ukuran,
        ketebalan,
        beratPiece,
        beratTabel,
        toleransi,
        warna,
        catatan: item.catatan ?? null,
        dibuatPada,
        batchId: item.batchId ?? null,
      });
    }

    // Tanggal terbaru di atas.
    // Jika tanggal sama, batch yang terakhir disimpan di atas.
    const sortedGroups = Array.from(grouped.values()).sort((a, b) => {
      const dateComparison = b.tanggalISO.localeCompare(a.tanggalISO);

      if (dateComparison !== 0) {
        return dateComparison;
      }

      if (a.latestTime !== b.latestTime) {
        return b.latestTime - a.latestTime;
      }

      return b.id - a.id;
    });

    // latestTime hanya digunakan untuk mengurutkan kelompok,
    // tidak perlu dikirim sebagai field tambahan ke frontend.
    const result = sortedGroups.map(({ latestTime, ...group }) => ({
      ...group,
      data: [...group.data].sort((a, b) => {
        const timeA = new Date(a.dibuatPada).getTime();
        const timeB = new Date(b.dibuatPada).getTime();

        if (timeA !== timeB) {
          return timeB - timeA;
        }

        return b.id - a.id;
      }),
    }));

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

    // UPDATE CATATAN SAJA
    if (body.action === 'updateCatatan') {
      const catatanId = Number(body.id);

      const catatan =
        typeof body.catatan === 'string'
          ? body.catatan.trim() || null
          : body.catatan === null
            ? null
            : undefined;

      if (!Number.isInteger(catatanId) || catatanId <= 0 || catatan === undefined) {
        return NextResponse.json(
          {
            success: false,
            error: 'ID data atau isi catatan tidak valid.',
          },
          { status: 400 }
        );
      }

      const existingCatatan = await prisma.dataPenimbangan.findUnique({
        where: { id: catatanId },
        select: {
          id: true,
          tanggal: true,
          catatan: true,
        },
      });

      if (!existingCatatan) {
        return NextResponse.json(
          {
            success: false,
            error: 'Data penimbangan untuk catatan tidak ditemukan.',
          },
          { status: 404 }
        );
      }

      if (existingCatatan.catatan !== catatan) {
        await prisma.dataPenimbangan.update({
          where: { id: catatanId },
          data: { catatan },
        });

        await createActivityNotification(
          'UPDATE',
          'Catatan penimbangan diperbarui',
          `Catatan pada data penimbangan hari ${formatDateLongForMessage(
            existingCatatan.tanggal
          )} berhasil diperbarui.`
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Catatan berhasil diperbarui.',
      });
    }

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

      const catatan =
        typeof item.catatan === 'string'
          ? item.catatan.trim() || null
          : item.catatan === null
            ? null
            : undefined;

      return {
        id: itemId,
        lebarMaterial,
        ukuran,
        ketebalan,
        beratPiece,
        beratTabel,
        warna: calculateColor(beratPiece, beratTabel, toleransi),
        catatan,
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
      where: { id: { in: ids } },
      select: {
        id: true,
        tanggal: true,
        toleransi: true,
        lebarMaterial: true,
        ukuran: true,
        ketebalan: true,
        beratPiece: true,
        beratTabel: true,
        catatan: true,
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

    const existingById = new Map(existingData.map((item) => [item.id, item]));

    const changedItems = normalizedData.filter((item) => {
      const oldItem = existingById.get(item.id);

      if (!oldItem) return false;

      const oldCatatan = oldItem.catatan ?? null;
      const newCatatan = item.catatan === undefined ? oldCatatan : item.catatan;

      return (
        normalizeDate(oldItem.tanggal) !== tanggalISO ||
        Number(oldItem.toleransi) !== toleransi ||
        Number(oldItem.lebarMaterial) !== item.lebarMaterial ||
        oldItem.ukuran !== item.ukuran ||
        Number(oldItem.ketebalan) !== item.ketebalan ||
        Number(oldItem.beratPiece) !== item.beratPiece ||
        Number(oldItem.beratTabel) !== item.beratTabel ||
        oldCatatan !== newCatatan
      );
    });

    await prisma.$transaction(
      normalizedData.map((item) =>
        prisma.dataPenimbangan.update({
          where: { id: item.id },
          data: {
            tanggal: tanggalISO,
            toleransi,
            lebarMaterial: item.lebarMaterial,
            ukuran: item.ukuran,
            ketebalan: item.ketebalan,
            beratPiece: item.beratPiece,
            beratTabel: item.beratTabel,
            warna: item.warna,
            ...(item.catatan !== undefined ? { catatan: item.catatan } : {}),
          },
        })
      )
    );

    if (changedItems.length > 0) {
      await createActivityNotification(
        'UPDATE',
        'Data penimbangan diperbarui',
        `Data penimbangan hari ${formatDateLongForMessage(tanggalISO)} berhasil diperbarui.`
      );
    }

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

// ==========================================
// DELETE DATA PENIMBANGAN BERDASARKAN ID
// ==========================================

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    const tanggal = String(body.tanggal ?? '').trim();
    const ids: unknown = body.ids;
    const tanggalISO = normalizeDate(tanggal);

    if (
      !tanggalISO ||
      !Array.isArray(ids) ||
      ids.length === 0 ||
      !ids.every(
        (itemId: unknown) => typeof itemId === 'number' && Number.isInteger(itemId) && itemId > 0
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tanggal atau daftar ID data tidak valid.',
        },
        { status: 400 }
      );
    }

    const dataIds = ids as number[];

    if (new Set(dataIds).size !== dataIds.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'Daftar ID mengandung duplikasi.',
        },
        { status: 400 }
      );
    }

    const existingData = await prisma.dataPenimbangan.findMany({
      where: { id: { in: dataIds } },
      select: {
        id: true,
        tanggal: true,
      },
    });

    const allBelongToDate =
      existingData.length === dataIds.length &&
      existingData.every((item) => normalizeDate(item.tanggal) === tanggalISO);

    if (!allBelongToDate) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Penghapusan dibatalkan karena ada data yang tidak ditemukan atau tanggalnya tidak sesuai.',
        },
        { status: 400 }
      );
    }

    const result = await prisma.dataPenimbangan.deleteMany({
      where: { id: { in: dataIds } },
    });

    if (result.count > 0) {
      await createActivityNotification(
        'DELETE',
        'Data penimbangan dihapus',
        `${result.count} data penimbangan hari ${formatDateLongForMessage(
          tanggalISO
        )} berhasil dihapus.`
      );
    }

    return NextResponse.json({
      success: true,
      message: `${result.count} data penimbangan berhasil dihapus.`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('DELETE DATA PENIMBANGAN ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Gagal menghapus semua data penimbangan.',
      },
      { status: 500 }
    );
  }
}
