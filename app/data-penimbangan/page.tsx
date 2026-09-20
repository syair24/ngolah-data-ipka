'use client';

import { useEffect, useState } from 'react';

import { CalendarDays, Scale } from 'lucide-react';

import Button from '@/components/Button';
import Modal from '@/components/Modal';
import DatePicker from '@/components/DatePicker';

interface WeighingItem {
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

interface WeighingCard {
  id: number;
  tanggal: string;
  toleransi: number;
  data: WeighingItem[];
}

function formatDateDisplay(value: string): string {
  if (!value) {
    return '';
  }

  return value;
}

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
// HITUNG WARNA
//
// Piece < batas bawah = Hijau
// Piece >= batas bawah && Piece <= batas atas = Putih
// Piece > batas atas = Merah
//
// Perbandingan menggunakan 2 angka di belakang koma
// TANPA PEMBULATAN.
// =========================================================

function calculateColor(
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

export default function WeighingDataPage() {
  const [weighingData, setWeighingData] = useState<WeighingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchDate, setSearchDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<WeighingCard | null>(null);

  // =========================================================
  // FETCH DATA
  // =========================================================

  useEffect(() => {
    const fetchWeighingData = async () => {
      try {
        setLoading(true);

        // GET API menggunakan parameter "tanggal"
        const url = searchDate
          ? `/api/data-penimbangan?tanggal=${encodeURIComponent(searchDate)}`
          : '/api/data-penimbangan';

        console.log('FETCH:', url);

        const response = await fetch(url, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Gagal mengambil data');
        }

        const result: WeighingCard[] = await response.json();

        console.log('RESULT:', result);
        console.log('JUMLAH CARD:', result.length);

        setWeighingData(result);
      } catch (error) {
        console.error('FETCH WEIGHING DATA ERROR:', error);
        setWeighingData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWeighingData();
  }, [searchDate]);

  // =========================================================
  // VIEW
  // =========================================================

  const handleView = (data: WeighingCard) => {
    setSelectedData(data);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedData(null);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="fixed top-0 left-55 right-0 z-50 h-16 border-b border-slate-700 bg-slate-800 shadow-lg">
        <div className="flex h-full items-center justify-between gap-6 px-6">
          {/* TITLE */}

          <div className="flex shrink-0 items-center">
            <h1 className="text-lg font-semibold text-white">Data Penimbangan</h1>
          </div>

          {/* FILTER */}

          <div className="flex shrink-0 items-center gap-4">
            {/* DATE FILTER */}

            <div className="w-[220px]">
              <div className="flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-900/60 px-3 py-2">
                <span className="text-xs font-medium text-slate-300">Tanggal</span>

                <DatePicker
                  value={searchDate}
                  onChange={(value) => {
                    console.log('Pilih Tanggal:', value);
                    setSearchDate(value);
                  }}
                  className="w-36 [&_input]:h-7 [&_input]:py-0"
                />
              </div>
            </div>

            {/* RECORD COUNT */}

            <div className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3.5 py-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                <Scale size={15} />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-white">{weighingData.length}</span>

                <span className="text-xs text-slate-400">Data</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="pt-16 p-6">
        <div className="w-full">
          {loading ? (
            <div className="text-sm text-slate-400">Memuat data penimbangan...</div>
          ) : weighingData.length === 0 ? (
            <div className="text-sm text-slate-400">Belum ada data penimbangan.</div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {weighingData.map((data, index) => (
                <div
                  key={data.id}
                  className="group relative rounded-2xl border border-slate-700 bg-slate-800/60 p-5 transition-all duration-300 hover:border-blue-500/50 hover:bg-slate-800 hover:shadow-xl hover:shadow-blue-500/10"
                >
                  {/* NUMBER */}

                  <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-xs font-semibold text-slate-300 shadow-lg transition-all duration-300 group-hover:border-blue-500/50 group-hover:bg-blue-600 group-hover:text-white">
                    {index + 1}
                  </div>

                  {/* CARD HEADER */}

                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500/20">
                      <Scale size={22} strokeWidth={2} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">Data Penimbangan</p>

                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                        <CalendarDays size={13} />

                        <span>{formatDateDisplay(data.tanggal)}</span>
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        Toleransi {Number(data.toleransi).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  <div className="my-2 h-px bg-slate-700/70" />

                  {/* BUTTONS */}

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(data)}
                      className="flex-1 border-slate-600 bg-transparent text-slate-300 hover:border-slate-500 hover:bg-slate-700 hover:text-white !outline-none !ring-0 !ring-offset-0 focus:!outline-none focus:!ring-0 focus:!ring-offset-0 focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0"
                    >
                      Lihat
                    </Button>

                    <Button
                      variant="warning"
                      size="sm"
                      className="flex-1 !outline-none !ring-0 !ring-offset-0 focus:!outline-none focus:!ring-0 focus:!ring-offset-0 focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0 hover:bg-blue-500"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* =====================================================
          MODAL
      ====================================================== */}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          selectedData
            ? `Data Penimbangan - ${formatDateDisplay(selectedData.tanggal)}`
            : 'Data Penimbangan'
        }
        size="6xl"
        footer={
          selectedData && (
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-5">
              {/* TOLERANSI */}

              <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2">
                <span className="text-xs text-slate-400">Toleransi</span>

                <span className="text-xs font-semibold text-slate-200">
                  ±{Number(selectedData.toleransi).toFixed(2)}%
                </span>
              </div>

              {/* ALL */}

              <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-700/20 px-3 py-2">
                <span className="text-xs text-slate-400">Semua</span>

                <span className="text-xs font-semibold text-white">{selectedData.data.length}</span>
              </div>

              {/* MERAH */}

              <div className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
                <span className="text-xs text-red-300">Merah</span>

                <span className="text-xs font-semibold text-red-300">
                  {
                    selectedData.data.filter((item) => {
                      const color = calculateColor(
                        Number(item.beratPiece),
                        Number(item.beratTabel),
                        Number(item.toleransi)
                      );

                      return color === 'Merah';
                    }).length
                  }
                </span>
              </div>

              {/* HIJAU */}

              <div className="flex items-center justify-between rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2">
                <span className="text-xs text-green-300">Hijau</span>

                <span className="text-xs font-semibold text-green-300">
                  {
                    selectedData.data.filter((item) => {
                      const color = calculateColor(
                        Number(item.beratPiece),
                        Number(item.beratTabel),
                        Number(item.toleransi)
                      );

                      return color === 'Hijau';
                    }).length
                  }
                </span>
              </div>

              {/* PUTIH */}

              <div className="flex items-center justify-between rounded-lg border border-slate-500/30 bg-slate-500/10 px-3 py-2">
                <span className="text-xs text-slate-300">Putih</span>

                <span className="text-xs font-semibold text-slate-300">
                  {
                    selectedData.data.filter((item) => {
                      const color = calculateColor(
                        Number(item.beratPiece),
                        Number(item.beratTabel),
                        Number(item.toleransi)
                      );

                      return color === 'Putih';
                    }).length
                  }
                </span>
              </div>
            </div>
          )
        }
      >
        {selectedData && (
          <div className="-m-6 flex h-[calc(85vh-73px-76px)] flex-col">
            <div
              className="
                relative
                flex-1
                overflow-x-auto
                overflow-y-auto
                [&::-webkit-scrollbar]:h-2
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-track]:bg-slate-800/40
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-slate-600/50
                hover:[&::-webkit-scrollbar-thumb]:bg-slate-500
                [&::-webkit-scrollbar-button]:hidden
              "
            >
              <table className="w-full min-w-[1050px] border-collapse text-center text-xs">
                {/* =================================================
                    TABLE HEADER
                ================================================== */}

                <thead className="sticky top-0 z-20 bg-slate-800 shadow-sm">
                  <tr className="border-b border-slate-700">
                    <th className="px-2.5 py-3 text-center font-semibold text-slate-300">No</th>

                    <th className="px-2.5 py-3 text-center font-semibold text-slate-300">
                      Lebar Material
                    </th>

                    <th className="px-2.5 py-3 text-center font-semibold text-slate-300">Ukuran</th>

                    <th className="px-2.5 py-3 text-center font-semibold text-slate-300">
                      Ketebalan
                    </th>

                    <th className="px-2.5 py-3 text-center font-semibold text-slate-300">
                      Berat Piece
                    </th>

                    <th className="px-2.5 py-3 text-center font-semibold text-slate-300">
                      Berat Tabel
                    </th>

                    <th className="px-2.5 py-3 text-center font-semibold text-slate-300">
                      +{Number(selectedData.toleransi).toFixed(2)}%
                    </th>

                    <th className="px-2.5 py-3 text-center font-semibold text-slate-300">
                      -{Number(selectedData.toleransi).toFixed(2)}%
                    </th>

                    <th className="px-2.5 py-3 text-center font-semibold text-slate-300">
                      Toleransi
                    </th>

                    <th className="px-2.5 py-3 text-center font-semibold text-slate-300">Warna</th>
                  </tr>
                </thead>

                {/* =================================================
                    TABLE BODY
                ================================================== */}

                <tbody>
                  {selectedData.data.map((item, index) => {
                    const tolerance = Number(item.toleransi);
                    const tableWeight = Number(item.beratTabel);
                    const pieceWeight = Number(item.beratPiece);

                    // ============================================
                    // HITUNG BATAS
                    // ============================================

                    const upperLimit = tableWeight + (tableWeight * tolerance) / 100;

                    const lowerLimit = tableWeight - (tableWeight * tolerance) / 100;

                    // ============================================
                    // WARNA DIHITUNG ULANG
                    // POTONG 2 ANGKA, BUKAN ROUND
                    // ============================================

                    const color = calculateColor(pieceWeight, tableWeight, tolerance);

                    const isGreen = color === 'Hijau';
                    const isRed = color === 'Merah';
                    const isWhite = color === 'Putih';

                    // ============================================
                    // ROW COLOR
                    // ============================================

                    const rowColorClass = isGreen
                      ? 'bg-green-500/10 text-green-300 border-green-500/20'
                      : isRed
                        ? 'bg-red-500/10 text-red-300 border-red-500/20'
                        : 'bg-transparent text-slate-300 border-slate-700/70';

                    // ============================================
                    // BADGE COLOR
                    // ============================================

                    const badgeColorClass = isGreen
                      ? 'bg-green-500/20 text-green-300'
                      : isRed
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-slate-500/10 text-slate-300';

                    return (
                      <tr key={item.id} className={`border-b last:border-b-0 ${rowColorClass}`}>
                        {/* NO */}

                        <td className="px-2.5 py-2 font-medium">{index + 1}</td>

                        {/* LEBAR MATERIAL */}

                        <td className="px-2.5 py-2 font-medium">
                          {Number(item.lebarMaterial).toFixed(2)}
                        </td>

                        {/* UKURAN */}

                        <td className="px-2.5 py-2 font-medium">{item.ukuran}</td>

                        {/* KETEBALAN */}

                        <td className="px-2.5 py-2 font-medium">
                          {Number(item.ketebalan).toFixed(2)}
                        </td>

                        {/* BERAT PIECE */}

                        <td className="px-2.5 py-2 font-semibold">{pieceWeight.toFixed(2)}</td>

                        {/* BERAT TABEL */}

                        <td className="px-2.5 py-2 font-medium">{tableWeight.toFixed(2)}</td>

                        {/* +TOLERANSI */}

                        <td className="px-2.5 py-2 font-medium text-green-400">
                          {upperLimit.toFixed(4)}
                        </td>

                        {/* -TOLERANSI */}

                        <td className="px-2.5 py-2 font-medium text-red-400">
                          {lowerLimit.toFixed(4)}
                        </td>

                        {/* TOLERANSI */}

                        <td className="px-2.5 py-2 font-medium">±{tolerance.toFixed(2)}%</td>

                        {/* WARNA */}

                        <td className="px-2.5 py-2 font-medium">
                          <span
                            className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-medium ${badgeColorClass}`}
                          >
                            {color}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
