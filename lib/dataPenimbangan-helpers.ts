export interface WeighingItem {
  id: number;
  lebarMaterial: number;
  ukuran: string;
  ketebalan: number;
  beratPiece: number;
  beratTabel: number;
  toleransi: number;
  warna: string;
  dibuatPada?: string;
}

export interface WeighingCard {
  id: number;
  tanggal: string;
  toleransi: number;
  user: {
    id: number;
    username: string;
    email: string;
  } | null;
  data: WeighingItem[];
}

export function formatDateDisplay(value: string): string {
  if (!value) {
    return '';
  }

  return value;
}

// Potong 2 angka di belakang koma, bukan pembulatan.
export function truncateTwoDecimals(value: number): number {
  return Math.trunc(value * 100) / 100;
}

// Hitung warna berdasarkan berat piece, berat tabel, dan toleransi.
export function calculateColor(
  pieceWeight: number,
  tableWeight: number,
  tolerance: number
): 'Hijau' | 'Putih' | 'Merah' {
  const upperLimit = tableWeight + (tableWeight * tolerance) / 100;
  const lowerLimit = tableWeight - (tableWeight * tolerance) / 100;

  const pieceCompare = truncateTwoDecimals(pieceWeight);
  const upperCompare = truncateTwoDecimals(upperLimit);
  const lowerCompare = truncateTwoDecimals(lowerLimit);

  if (pieceCompare < lowerCompare) {
    return 'Hijau';
  }

  if (pieceCompare > upperCompare) {
    return 'Merah';
  }

  return 'Putih';
}
