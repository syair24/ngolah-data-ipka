'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';

interface WeighingItem {
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

export default function SeluruhDataPage() {
  const [data, setData] = useState<WeighingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filterLebar, setFilterLebar] = useState('');
  const [filterUkuran, setFilterUkuran] = useState('');
  const [filterKetebalan, setFilterKetebalan] = useState('');

  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/data-penimbangan', {
          cache: 'no-store',
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Gagal mengambil data penimbangan.');
        }

        if (!Array.isArray(result)) {
          throw new Error('Format data dari server tidak valid.');
        }

        const flattenedData: WeighingItem[] = (result as ApiGroup[]).flatMap((group) =>
          group.data.map((item) => ({
            id: item.id,
            tanggal: group.tanggalISO,
            lebarMaterial: Number(item.lebarMaterial),
            ukuran: item.ukuran,
            ketebalan: Number(item.ketebalan),
            beratPiece: Number(item.beratPiece),
            beratTabel: Number(item.beratTabel),
            toleransi: Number(item.toleransi),
            warna: item.warna,
            dibuatPada: item.dibuatPada,
          }))
        );

        setData(flattenedData);
      } catch (err) {
        console.error('GET SELURUH DATA ERROR:', err);

        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format angka selalu 2 angka desimal
  const formatDecimal = (value: number) => {
    return Number(value).toFixed(2);
  };

  // Format tanggal
  const formatTanggal = (tanggal: string) => {
    const date = new Date(`${tanggal}T00:00:00`);

    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Normalisasi teks ukuran:
  // Huruf besar/kecil dianggap sama.
  // Semua jenis spasi dihapus.
  // Karakter selain huruf dan angka tetap dipertahankan.
  const normalizeText = (value: string) => {
    return String(value ?? '')
      .normalize('NFKC')
      .toLocaleLowerCase('id-ID')
      .replace(/[\s\u00A0\u2000-\u200B\u202F\u205F\u3000]+/g, '');
  };

  // Normalisasi angka:
  // 0.50 = 0.5 = 0,50
  const normalizeNumber = (value: string | number) => {
    const normalized = String(value).trim().replace(',', '.');
    const number = Number(normalized);

    if (!Number.isFinite(number)) {
      return normalized;
    }

    return number.toString();
  };

  // Filter data
  const filteredData = useMemo(() => {
    const normalizedFilterLebar = filterLebar.trim();
    const normalizedFilterUkuran = normalizeText(filterUkuran);
    const normalizedFilterKetebalan = normalizeNumber(filterKetebalan);

    return data.filter((item) => {
      // Filter Lebar Material
      const matchLebar =
        normalizedFilterLebar === '' || String(item.lebarMaterial).includes(normalizedFilterLebar);

      // Filter Ukuran
      const normalizedUkuran = normalizeText(item.ukuran);

      const matchUkuran =
        normalizedFilterUkuran === '' || normalizedUkuran.includes(normalizedFilterUkuran);

      // Filter Ketebalan
      const normalizedKetebalan = normalizeNumber(item.ketebalan);

      const matchKetebalan =
        filterKetebalan.trim() === '' || normalizedKetebalan.includes(normalizedFilterKetebalan);

      return matchLebar && matchUkuran && matchKetebalan;
    });
  }, [data, filterLebar, filterUkuran, filterKetebalan]);

  // Pengelompokan tanggal dan pengurutan ascending
  const groupedData = useMemo(() => {
    const groups = new Map<string, WeighingItem[]>();

    filteredData.forEach((item) => {
      const key = item.tanggal;

      if (!groups.has(key)) {
        groups.set(key, []);
      }

      groups.get(key)!.push(item);
    });

    return Array.from(groups.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([tanggal, items]) => ({
        tanggal,
        items: items.sort((a, b) => a.id - b.id),
      }));
  }, [filteredData]);

  // Buka/tutup kelompok tanggal
  const toggleDate = (tanggal: string) => {
    setExpandedDates((previous) => {
      const next = new Set(previous);

      if (next.has(tanggal)) {
        next.delete(tanggal);
      } else {
        next.add(tanggal);
      }

      return next;
    });
  };

  // Warna baris berdasarkan status
  const getRowColor = (warna: WeighingItem['warna']) => {
    switch (warna) {
      case 'Hijau':
        return 'bg-green-50';

      case 'Merah':
        return 'bg-red-50';

      default:
        return 'bg-white';
    }
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-[220px] right-0 z-50 h-16 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex h-full items-center px-5">
          <h1 className="text-base font-semibold text-gray-900">Seluruh Data Penimbangan</h1>
        </div>
      </header>

      {/* Main: memenuhi area layar di bawah header */}
      <main className="fixed inset-x-0 bottom-0 left-[220px] top-16 overflow-hidden bg-gray-50 p-5">
        <div className="flex h-full min-h-0 flex-col">
          {/* Table Container */}
          <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full table-fixed border-separate border-spacing-0 text-xs">
              <colgroup>
                <col style={{ width: '7%' }} />
                <col style={{ width: '17%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '16%' }} />
              </colgroup>

              <thead className="sticky top-0 z-20 bg-white">
                <tr className="bg-white">
                  <th className="border-b border-gray-200 bg-white px-2 py-3 text-center font-semibold text-gray-700">
                    No
                  </th>

                  <th className="border-b border-gray-200 bg-white px-2 py-3 text-center font-semibold text-gray-700">
                    Lebar Material
                  </th>

                  <th className="border-b border-gray-200 bg-white px-2 py-3 text-center font-semibold text-gray-700">
                    Ukuran
                  </th>

                  <th className="border-b border-gray-200 bg-white px-2 py-3 text-center font-semibold text-gray-700">
                    Ketebalan
                  </th>

                  <th className="border-b border-gray-200 bg-white px-2 py-3 text-center font-semibold text-gray-700">
                    Berat Piece
                  </th>

                  <th className="border-b border-gray-200 bg-white px-2 py-3 text-center font-semibold text-gray-700">
                    Berat Tabel
                  </th>

                  <th className="border-b border-gray-200 bg-white px-2 py-3 text-center font-semibold text-gray-700">
                    Toleransi
                  </th>
                </tr>

                {/* Filter */}
                <tr className="bg-white">
                  <th className="border-b border-gray-200 bg-white px-2 py-2"></th>

                  <th className="border-b border-gray-200 bg-white px-2 py-2">
                    <input
                      type="text"
                      value={filterLebar}
                      onChange={(e) => setFilterLebar(e.target.value)}
                      placeholder="Filter..."
                      className="h-7 w-full rounded border border-gray-300 bg-white px-2 text-center text-xs font-normal text-gray-700 outline-none focus:border-blue-500"
                    />
                  </th>

                  <th className="border-b border-gray-200 bg-white px-2 py-2">
                    <input
                      type="text"
                      value={filterUkuran}
                      onChange={(e) => setFilterUkuran(e.target.value)}
                      placeholder="Filter..."
                      className="h-7 w-full rounded border border-gray-300 bg-white px-2 text-center text-xs font-normal text-gray-700 outline-none focus:border-blue-500"
                    />
                  </th>

                  <th className="border-b border-gray-200 bg-white px-2 py-2">
                    <input
                      type="text"
                      value={filterKetebalan}
                      onChange={(e) => setFilterKetebalan(e.target.value)}
                      placeholder="Filter..."
                      className="h-7 w-full rounded border border-gray-300 bg-white px-2 text-center text-xs font-normal text-gray-700 outline-none focus:border-blue-500"
                    />
                  </th>

                  <th className="border-b border-gray-200 bg-white px-2 py-2"></th>

                  <th className="border-b border-gray-200 bg-white px-2 py-2"></th>

                  <th className="border-b border-gray-200 bg-white px-2 py-2"></th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                      Memuat data penimbangan...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : groupedData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                      {data.length === 0
                        ? 'Belum ada data penimbangan.'
                        : 'Tidak ada data yang sesuai dengan filter.'}
                    </td>
                  </tr>
                ) : (
                  groupedData.map((group) => {
                    const isExpanded = expandedDates.has(group.tanggal);

                    return (
                      <Fragment key={group.tanggal}>
                        {/* Group tanggal */}
                        <tr>
                          <td colSpan={7} className="border-b border-blue-200 bg-blue-50 px-3 py-2">
                            <button
                              type="button"
                              onClick={() => toggleDate(group.tanggal)}
                              className="flex w-full items-center justify-start gap-2 text-left"
                            >
                              <span className="flex h-5 w-5 items-center justify-center rounded text-blue-700">
                                {isExpanded ? '▼' : '▶'}
                              </span>

                              <span className="font-semibold text-blue-900">
                                {formatTanggal(group.tanggal)}
                              </span>

                              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                                {group.items.length} Data
                              </span>
                            </button>
                          </td>
                        </tr>

                        {/* Baris data */}
                        {isExpanded &&
                          group.items.map((item, index) => (
                            <tr
                              key={item.id}
                              className={`${getRowColor(item.warna)} hover:brightness-[0.98]`}
                            >
                              <td className="border-b border-gray-100 px-2 py-2 text-center text-gray-700">
                                {index + 1}
                              </td>

                              <td className="border-b border-gray-100 px-2 py-2 text-center text-gray-700">
                                {item.lebarMaterial}
                              </td>

                              <td className="border-b border-gray-100 px-2 py-2 text-center text-gray-700">
                                {item.ukuran}
                              </td>

                              <td className="border-b border-gray-100 px-2 py-2 text-center text-gray-700">
                                {formatDecimal(item.ketebalan)}
                              </td>

                              <td className="border-b border-gray-100 px-2 py-2 text-center text-gray-700">
                                {formatDecimal(item.beratPiece)}
                              </td>

                              <td className="border-b border-gray-100 px-2 py-2 text-center text-gray-700">
                                {formatDecimal(item.beratTabel)}
                              </td>

                              <td className="border-b border-gray-100 px-2 py-2 text-center text-gray-700">
                                {formatDecimal(item.toleransi)}%
                              </td>
                            </tr>
                          ))}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
