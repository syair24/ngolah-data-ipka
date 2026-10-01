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
      return a.id - b.id; // Diubah supaya ID terkecil (atau data hijau) ada di atas
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
          <div className="flex h-full items-center px-6">
            <h1 className="text-lg font-semibold text-gray-900">Production Dashboard</h1>
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
            <span className="text-sm font-medium leading-none text-emerald-700">{username}</span>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <div className="p-6">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Production Summary</h3>

              <p className="mt-1 text-xs text-gray-500">Seluruh data produksi bulan berjalan</p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
              <span className="text-xs font-medium text-gray-700">{periodeBulan}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Data</p>

                  <p className="mt-2 text-2xl font-semibold text-gray-900">
                    {totalData.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Scale size={20} className="text-blue-600" />
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-500">Total data {periodeBulan}</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">+ Toleransi</p>

                  <p className="mt-2 text-2xl font-semibold text-red-600">
                    {diAtasToleransi.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                  <TrendingUp size={20} className="text-red-600" />
                </div>
              </div>

              <p className="mt-3 text-xs text-red-600">Di atas batas toleransi</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">- Toleransi</p>

                  <p className="mt-2 text-2xl font-semibold text-emerald-600">
                    {diBawahToleransi.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                  <TrendingDown size={20} className="text-emerald-600" />
                </div>
              </div>

              <p className="mt-3 text-xs text-emerald-600">Di bawah batas toleransi</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Sesuai Toleransi</p>

                  <p className="mt-2 text-2xl font-semibold text-gray-900">
                    {sesuaiToleransi.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <CheckCircle2 size={20} className="text-gray-700" />
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-500">Berat berada dalam batas toleransi</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Latest Production Data</h3>

                <p className="mt-1 text-sm text-gray-500">
                  {tanggalTerbaru
                    ? `Data penimbangan terakhir — ${tanggalTerbaru}`
                    : 'Belum ada data penimbangan'}
                </p>
              </div>

              <div className="shrink-0">
                <span className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700">
                  {latestDateData.length} data
                </span>
              </div>
            </div>

            <div className="dashboard-scrollbar text-center h-[420px] overflow-x-auto overflow-y-auto rounded-lg border border-gray-200">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead className="sticky top-0 z-20 bg-gray-100">
                  <tr className="border-b border-gray-200 text-center text-xs font-medium uppercase text-gray-600">
                    <th className="whitespace-nowrap px-3 py-3 font-medium text-gray-600">No</th>

                    <th className="whitespace-nowrap px-3 py-3 font-medium text-gray-600">
                      Lebar Material
                    </th>

                    <th className="whitespace-nowrap px-3 py-3 font-medium text-gray-600">
                      Ukuran
                    </th>

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
                          <td className="whitespace-nowrap px-3 py-3 text-gray-500">{index + 1}</td>

                          <td className="whitespace-nowrap px-3 py-3 text-gray-700">
                            {item.lebarMaterial}
                          </td>

                          <td className="whitespace-nowrap px-3 py-3 font-medium text-gray-900">
                            {item.ukuran}
                          </td>

                          <td className="whitespace-nowrap px-3 py-3 text-gray-700">
                            {item.ketebalan.toFixed(1)} mm
                          </td>

                          <td className="whitespace-nowrap px-3 py-3 text-gray-900 font-medium">
                            {item.beratPiece.toFixed(2)} kg
                          </td>

                          <td className="whitespace-nowrap px-3 py-3 text-gray-700">
                            {item.beratTabel.toFixed(2)} kg
                          </td>

                          <td className="whitespace-nowrap px-3 py-3 text-gray-700">
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
