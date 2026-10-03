'use client';

import { useEffect, useMemo, useState } from 'react';

import { Scale, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';

import WeightToleranceChart from '@/components/WeightToleranceChart';

interface ProductionData {
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

interface ApiGroup {
  id: number;
  tanggal: string;
  tanggalISO: string;
  toleransi: number;
  user?: {
    id: number;
    username: string;
    email: string;
  } | null;
  data: ProductionData[];
}

function getStatus(item: ProductionData) {
  if (item.warna === 'Hijau') {
    return 'Di bawah toleransi';
  }

  if (item.warna === 'Merah') {
    return 'Di atas toleransi';
  }

  return 'Sesuai';
}

function getMonthName(month: number) {
  const months = [
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

  return months[month];
}

function formatDate(value: string) {
  if (!value) return '-';

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    const [, year, month, day] = match;
    return `${day}-${month}-${year}`;
  }

  return value;
}

export default function DashboardPage() {
  const [data, setData] = useState<ProductionData[]>([]);
  const [weighingGroups, setWeighingGroups] = useState<ApiGroup[]>([]);

  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const savedUsername = sessionStorage.getItem('username') || localStorage.getItem('username');

    if (savedUsername?.trim()) {
      setUsername(savedUsername.trim());
    }

    async function loadData() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/data-penimbangan', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Gagal mengambil data. Status: ${response.status}`);
        }

        const result: ApiGroup[] = await response.json();

        if (!Array.isArray(result)) {
          throw new Error('Format data dari API tidak valid.');
        }

        if (mounted) {
          // Data grup asli untuk grafik bulanan.
          setWeighingGroups(result);

          // Data flat untuk KPI dan tabel dashboard.
          const databaseData: ProductionData[] = result.flatMap((group) =>
            group.data.map((item) => ({
              ...item,
              tanggal: group.tanggalISO || group.tanggal,
            }))
          );

          setData(databaseData);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Gagal mengambil data dari database.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const now = new Date();

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyData = useMemo(() => {
    return data.filter((item) => {
      const dateValue = item.tanggal || item.dibuatPada;

      const match = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})/);

      if (!match) return false;

      const year = Number(match[1]);
      const month = Number(match[2]) - 1;

      return month === currentMonth && year === currentYear;
    });
  }, [data, currentMonth, currentYear]);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const dateA = a.tanggal || '';
      const dateB = b.tanggal || '';

      const dateDifference = dateA.localeCompare(dateB);

      if (dateDifference !== 0) {
        return dateDifference;
      }

      return new Date(a.dibuatPada).getTime() - new Date(b.dibuatPada).getTime();
    });
  }, [data]);

  const tanggalTerbaru = useMemo(() => {
    if (sortedData.length === 0) {
      return null;
    }

    return sortedData[0].tanggal;
  }, [sortedData]);

  const latestDateData = useMemo(() => {
    if (!tanggalTerbaru) {
      return [];
    }

    return sortedData.filter((item) => item.tanggal === tanggalTerbaru);
  }, [sortedData, tanggalTerbaru]);

  const totalData = monthlyData.length;

  const diAtasToleransi = monthlyData.filter(
    (item) => getStatus(item) === 'Di atas toleransi'
  ).length;

  const diBawahToleransi = monthlyData.filter(
    (item) => getStatus(item) === 'Di bawah toleransi'
  ).length;

  const sesuaiToleransi = monthlyData.filter((item) => getStatus(item) === 'Sesuai').length;

  const periodeBulan = `${getMonthName(currentMonth)} ${currentYear}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="fixed top-0 left-[220px] right-0 z-50 h-16 border-b border-gray-200 bg-white shadow-sm">
          <div className="flex h-full items-center justify-between px-6">
            <h1 className="text-lg font-semibold text-gray-900">Production Dashboard</h1>

            <div className="flex h-9 items-center rounded-md border border-emerald-200 bg-emerald-50 px-3.5">
              <span className="text-sm font-medium leading-none text-emerald-700">
                {username || 'Memuat akun...'}
              </span>
            </div>
          </div>
        </header>

        <main className="pt-16">
          <div className="p-6">
            <div className="flex h-[500px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />

                <p className="mt-4 text-sm text-gray-500">Memuat data dari database...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 left-[220px] right-0 z-50 h-16 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex h-full items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-900">Production Dashboard</h1>

          <div className="flex h-9 items-center rounded-md border border-emerald-200 bg-emerald-50 px-3.5">
            <span className="text-sm font-medium leading-none text-emerald-700">
              {username || 'Akun tidak ditemukan'}
            </span>
          </div>
        </div>
      </header>

      <main className="pt-13 px-3">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Monthly Chart */}
        <WeightToleranceChart data={weighingGroups} />

        {/* Latest Production Data */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Latest Production Data</h3>

              <p className="mt-1 text-sm text-gray-500">
                {tanggalTerbaru
                  ? `Data penimbangan terakhir — ${formatDate(tanggalTerbaru)}`
                  : 'Belum ada data penimbangan'}
              </p>
            </div>

            <div className="shrink-0">
              <span className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700">
                {latestDateData.length} data
              </span>
            </div>
          </div>

          <div className="dashboard-scrollbar h-[420px] overflow-x-auto overflow-y-auto rounded-lg border border-gray-200">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead className="sticky top-0 z-20 bg-gray-100">
                <tr className="border-b border-gray-200 text-center text-xs font-medium uppercase text-gray-600">
                  <th className="whitespace-nowrap px-3 py-3 font-medium text-gray-600">No</th>

                  <th className="whitespace-nowrap px-3 py-3 font-medium text-gray-600">
                    Lebar Material
                  </th>

                  <th className="whitespace-nowrap px-3 py-3 font-medium text-gray-600">Ukuran</th>

                  <th className="whitespace-nowrap px-3 py-3 font-medium text-gray-600">
                    Ketebalan
                  </th>

                  <th className="whitespace-nowrap px-3 py-3 font-medium text-gray-600">
                    Berat Kg/Btg
                  </th>

                  <th className="whitespace-nowrap px-3 py-3 font-medium text-gray-600">
                    Berat Tabel
                  </th>

                  <th className="whitespace-nowrap px-3 py-3 font-medium text-gray-600">
                    Toleransi
                  </th>
                </tr>
              </thead>

              <tbody>
                {latestDateData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div>
                        <p className="text-sm text-gray-500">Belum ada data penimbangan.</p>

                        <p className="mt-1 text-xs text-gray-400">
                          Data yang lo input akan muncul di sini.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  latestDateData.map((item, index) => {
                    const status = getStatus(item);

                    let rowClass = '';

                    if (status === 'Di bawah toleransi') {
                      rowClass = 'bg-emerald-50 hover:bg-emerald-100/60';
                    } else if (status === 'Di atas toleransi') {
                      rowClass = 'bg-red-50 hover:bg-red-100/60';
                    } else {
                      rowClass = 'bg-white hover:bg-gray-50';
                    }

                    return (
                      <tr
                        key={item.id}
                        className={`${rowClass} border-b border-gray-200 transition`}
                      >
                        <td className="whitespace-nowrap px-3 py-3 text-center text-gray-500">
                          {index + 1}
                        </td>

                        <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                          {item.lebarMaterial}
                        </td>

                        <td className="whitespace-nowrap px-3 py-3 text-center font-medium text-gray-900">
                          {item.ukuran}
                        </td>

                        <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                          {item.ketebalan.toFixed(1)} mm
                        </td>

                        <td className="whitespace-nowrap px-3 py-3 text-center font-medium text-gray-900">
                          {item.beratPiece.toFixed(2)} kg
                        </td>

                        <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                          {item.beratTabel.toFixed(2)} kg
                        </td>

                        <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                          ±{item.toleransi}%
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
