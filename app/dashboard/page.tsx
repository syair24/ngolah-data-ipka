'use client';

import { useEffect, useMemo, useState } from 'react';

import { Scale, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';

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
  toleransi: number;
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

export default function DashboardPage() {
  const [data, setData] = useState<ProductionData[]>([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    // Ambil username yang disimpan saat login
    const savedUsername = sessionStorage.getItem('username');

    if (savedUsername) {
      setUsername(savedUsername);
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

        const databaseData = result.flatMap((group) =>
          group.data.map((item) => ({
            ...item,
            tanggal: group.tanggal,
          }))
        );

        if (mounted) {
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
      const date = new Date(item.dibuatPada);

      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
  }, [data, currentMonth, currentYear]);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      return new Date(b.dibuatPada).getTime() - new Date(a.dibuatPada).getTime();
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
      <div className="min-h-screen bg-slate-900">
        <header className="fixed top-0 left-[220px] right-0 z-50 h-16 border-b border-slate-700 bg-slate-800 shadow-lg">
          <div className="flex h-full items-center px-6">
            <h1 className="text-lg font-semibold text-white">Production Dashboard</h1>
          </div>
        </header>

        <main className="pt-16">
          <div className="p-6">
            <div className="flex h-[500px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-blue-400" />

                <p className="mt-4 text-sm text-slate-400">Memuat data dari database...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="fixed top-0 left-[220px] right-0 z-50 h-16 border-b border-slate-700 bg-slate-800 shadow-lg">
        <div className="flex h-full items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-white">Production Dashboard</h1>

          <div className="flex h-9 items-center rounded-md border border-emerald-800/70 bg-emerald-950/40 px-3.5">
            <span className="text-sm font-medium leading-none text-emerald-400">{username}</span>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <div className="p-6">
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white">Production Summary</h3>

              <p className="mt-1 text-xs text-slate-500">Seluruh data produksi bulan berjalan</p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5">
              <span className="text-xs font-medium text-slate-300">{periodeBulan}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Data</p>

                  <p className="mt-2 text-2xl font-semibold text-white">
                    {totalData.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <Scale size={20} className="text-blue-400" />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500">Total data {periodeBulan}</p>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">+ Toleransi</p>

                  <p className="mt-2 text-2xl font-semibold text-red-400">
                    {diAtasToleransi.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                  <TrendingUp size={20} className="text-red-400" />
                </div>
              </div>

              <p className="mt-3 text-xs text-red-400">Di atas batas toleransi</p>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">- Toleransi</p>

                  <p className="mt-2 text-2xl font-semibold text-emerald-400">
                    {diBawahToleransi.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <TrendingDown size={20} className="text-emerald-400" />
                </div>
              </div>

              <p className="mt-3 text-xs text-emerald-400">Di bawah batas toleransi</p>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Sesuai Toleransi</p>

                  <p className="mt-2 text-2xl font-semibold text-white">
                    {sesuaiToleransi.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-500/10">
                  <CheckCircle2 size={20} className="text-slate-300" />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">Berat berada dalam batas toleransi</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800/50 p-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Latest Production Data</h3>

                <p className="mt-1 text-sm text-slate-400">
                  {tanggalTerbaru
                    ? `Data penimbangan terakhir — ${tanggalTerbaru}`
                    : 'Belum ada data penimbangan'}
                </p>
              </div>

              <div className="shrink-0">
                <span className="inline-flex items-center rounded-lg border border-slate-600 bg-slate-700/70 px-3 py-1.5 text-xs text-slate-300">
                  {latestDateData.length} data
                </span>
              </div>
            </div>

            <div className="dashboard-scrollbar h-[420px] overflow-x-auto overflow-y-auto rounded-lg border border-slate-700">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead className="sticky top-0 z-20 bg-slate-800">
                  <tr className="border-b border-slate-700 text-left">
                    <th className="whitespace-nowrap px-3 py-3 font-medium text-slate-400">No</th>

                    <th className="whitespace-nowrap px-3 py-3 font-medium text-slate-400">
                      Lebar Material
                    </th>

                    <th className="whitespace-nowrap px-3 py-3 font-medium text-slate-400">
                      Ukuran
                    </th>

                    <th className="whitespace-nowrap px-3 py-3 font-medium text-slate-400">
                      Ketebalan
                    </th>

                    <th className="whitespace-nowrap px-3 py-3 font-medium text-slate-400">
                      Berat Piece
                    </th>

                    <th className="whitespace-nowrap px-3 py-3 font-medium text-slate-400">
                      Berat Tabel
                    </th>

                    <th className="whitespace-nowrap px-3 py-3 font-medium text-slate-400">
                      Toleransi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {latestDateData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <div>
                          <p className="text-sm text-slate-400">Belum ada data penimbangan.</p>

                          <p className="mt-1 text-xs text-slate-600">
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
                        rowClass = 'bg-emerald-500/10 hover:bg-emerald-500/15';
                      } else if (status === 'Di atas toleransi') {
                        rowClass = 'bg-red-500/10 hover:bg-red-500/15';
                      } else {
                        rowClass = 'bg-slate-800/20 hover:bg-slate-800/70';
                      }

                      return (
                        <tr
                          key={item.id}
                          className={`${rowClass} border-b border-slate-700/50 transition`}
                        >
                          <td className="whitespace-nowrap px-3 py-3 text-slate-400">
                            {index + 1}
                          </td>

                          <td className="whitespace-nowrap px-3 py-3 text-slate-300">
                            {item.lebarMaterial}
                          </td>

                          <td className="whitespace-nowrap px-3 py-3 font-medium text-white">
                            {item.ukuran}
                          </td>

                          <td className="whitespace-nowrap px-3 py-3 text-slate-300">
                            {item.ketebalan.toFixed(1)} mm
                          </td>

                          <td className="whitespace-nowrap px-3 py-3 text-white">
                            {item.beratPiece.toFixed(2)} kg
                          </td>

                          <td className="whitespace-nowrap px-3 py-3 text-slate-300">
                            {item.beratTabel.toFixed(2)} kg
                          </td>

                          <td className="whitespace-nowrap px-3 py-3 text-slate-300">
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
        </div>
      </main>
    </div>
  );
}
