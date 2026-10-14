export interface WeighingItem {
  id: number;
  tanggal: string;
  lebarMaterial: number;
  ukuran: string;
  ketebalan: number;
  beratPiece: number;
  beratTabel: number;
  toleransi: number;
  warna: 'Hijau' | 'Putih' | 'Merah';
  dibuatPada: string;
}

export interface ApiGroup {
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

// Format angka menjadi 2 angka desimal
export const formatDecimal = (value: number): string => {
  return Number(value).toFixed(2);
};

// Format tanggal ke format Indonesia
export const formatTanggal = (tanggal: string): string => {
  const date = new Date(`${tanggal}T00:00:00`);

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

// Normalisasi teks ukuran
// Huruf besar/kecil dianggap sama.
// Semua jenis spasi dihapus.
// Karakter selain huruf dan angka tetap dipertahankan.
export const normalizeText = (value: string): string => {
  return String(value ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase('id-ID')
    .replace(/[\s\u00A0\u2000-\u200B\u202F\u205F\u3000]+/g, '');
};

// Normalisasi angka
// Contoh: 0.50 = 0.5 = 0,50
export const normalizeNumber = (value: string | number): string => {
  const normalized = String(value).trim().replace(',', '.');
  const number = Number(normalized);

  if (!Number.isFinite(number)) {
    return normalized;
  }

  return number.toString();
};

// Warna baris berdasarkan status toleransi
export const getRowColor = (warna: WeighingItem['warna']): string => {
  switch (warna) {
    case 'Hijau':
      return 'bg-green-50';

    case 'Merah':
      return 'bg-red-50';

    default:
      return 'bg-white';
  }
};
