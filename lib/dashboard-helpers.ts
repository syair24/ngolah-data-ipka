'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

// ==================== TIPE DATA ====================

export interface ProductionData {
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
  batchId?: string | null;
}

export interface ApiGroup {
  id: number;
  tanggal: string;
  tanggalISO: string;
  toleransi: number;
  batchId?: string | null;
  user?: {
    id: number;
    username: string;
    email: string;
  } | null;
  data: ProductionData[];
}

interface DashboardDataResult {
  groups: ApiGroup[];
  data: ProductionData[];
}

// ==================== HELPER ====================

export function getStatus(item: ProductionData): string {
  if (item.warna === 'Hijau') return 'Di bawah toleransi';
  if (item.warna === 'Merah') return 'Di atas toleransi';
  return 'Sesuai';
}

export function formatDate(value: string): string {
  if (!value) return '-';

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) return value;

  const [, year, month, day] = match;

  return `${day}-${month}-${year}`;
}

export function sortProductionData(data: ProductionData[]): ProductionData[] {
  return [...data].sort((a, b) => {
    const dateDifference = (b.tanggal || '').localeCompare(a.tanggal || '');

    if (dateDifference !== 0) return dateDifference;

    const timeA = a.dibuatPada ? new Date(a.dibuatPada).getTime() : 0;

    const timeB = b.dibuatPada ? new Date(b.dibuatPada).getTime() : 0;

    if (timeA !== timeB) return timeB - timeA;

    return Number(b.id) - Number(a.id);
  });
}

// ==================== SESI TERBARU ====================

export function getLatestDateData(data: ProductionData[]): ProductionData[] {
  if (data.length === 0) return [];

  // Urutkan seluruh data berdasarkan waktu pencatatan,
  // bukan berdasarkan tanggal produksi.
  const sortedByInputTime = [...data].sort((a, b) => {
    const timeA = a.dibuatPada ? new Date(a.dibuatPada).getTime() : 0;

    const timeB = b.dibuatPada ? new Date(b.dibuatPada).getTime() : 0;

    if (timeA !== timeB) return timeB - timeA;

    return Number(b.id) - Number(a.id);
  });

  // Cari baris terbaru yang memiliki batchId.
  const latestBatchRow = sortedByInputTime.find(
    (item) => item.batchId !== null && item.batchId !== undefined && item.batchId !== ''
  );

  // Jika ditemukan, tampilkan hanya sesi tersebut.
  if (latestBatchRow?.batchId) {
    const latestBatchId = latestBatchRow.batchId;

    return sortedByInputTime.filter((item) => item.batchId === latestBatchId);
  }

  // Fallback untuk data lama yang semuanya batchId-nya NULL.
  const sorted = sortProductionData(data);

  if (sorted.length === 0) return [];

  const latestDate = sorted[0].tanggal;

  return sorted.filter((item) => item.tanggal === latestDate).reverse();
}

// ==================== API SERVICE ====================

async function fetchDashboardData(): Promise<DashboardDataResult> {
  const response = await fetch('/api/data-penimbangan', {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Gagal mengambil data. Status: ${response.status}`);
  }

  const result: unknown = await response.json();

  if (!Array.isArray(result)) {
    throw new Error('Format data dari API tidak valid.');
  }

  const groups = result as ApiGroup[];

  const data: ProductionData[] = groups.flatMap((group) =>
    group.data.map((item) => ({
      ...item,
      batchId: item.batchId ?? group.batchId ?? null,
      tanggal: group.tanggalISO || group.tanggal,
    }))
  );

  return { groups, data };
}

// ==================== USERNAME ====================

function subscribeUsername(onChange: () => void) {
  window.addEventListener('storage', onChange);

  return () => {
    window.removeEventListener('storage', onChange);
  };
}

function getUsernameSnapshot(): string {
  return window.sessionStorage.getItem('username') || window.localStorage.getItem('username') || '';
}

function getUsernameServerSnapshot(): string {
  return '';
}

export function useDashboardUsername(): string {
  return useSyncExternalStore(subscribeUsername, getUsernameSnapshot, getUsernameServerSnapshot);
}

// ==================== DASHBOARD HOOK ====================

export function useDashboardData() {
  const [data, setData] = useState<ProductionData[]>([]);
  const [weighingGroups, setWeighingGroups] = useState<ApiGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const result = await fetchDashboardData();

        if (mounted) {
          setData(result.data);
          setWeighingGroups(result.groups);
          setError('');
        }
      } catch (err: unknown) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Gagal mengambil data dari database.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const sortedData = useMemo(() => sortProductionData(data), [data]);

  // Data dashboard mengikuti sesi yang terakhir disimpan.
  const latestDateData = useMemo(() => getLatestDateData(data), [data]);

  // Tanggal yang ditampilkan mengikuti sesi terpilih.
  const tanggalTerbaru = useMemo(
    () => (latestDateData.length > 0 ? latestDateData[0].tanggal : null),
    [latestDateData]
  );

  return {
    data,
    weighingGroups,
    loading,
    error,
    sortedData,
    tanggalTerbaru,
    latestDateData,
  };
}
