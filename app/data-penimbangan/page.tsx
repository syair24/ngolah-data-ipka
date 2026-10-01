'use client';

import { useEffect, useState } from 'react';

import { CalendarDays, FileSpreadsheet, Scale } from 'lucide-react';

import Button from '@/components/Button';
import Modal from '@/components/Modal';
import DatePicker from '@/components/DatePicker';
import { exportToExcel } from '@/helpers/exportExcel';

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
// =========================================================

function truncateTwoDecimals(value: number): number {
  return Math.trunc(value * 100) / 100;
}

// =========================================================
// HITUNG WARNA
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

        const url = searchDate
          ? `/api/data-penimbangan?tanggal=${encodeURIComponent(searchDate)}`
          : '/api/data-penimbangan';

        const response = await fetch(url, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Gagal mengambil data');
        }

        const result: WeighingCard[] = await response.json();

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
  // MODAL TITLE
  // =========================================================

  const modalTitle: string = selectedData
    ? `Data Penimbangan - ${formatDateDisplay(selectedData.tanggal)}`
    : 'Data Penimbangan';

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="fixed top-0 left-55 right-0 z-50 h-16 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex h-full items-center justify-between gap-6 px-6">
          {/* TITLE */}

          <div className="flex shrink-0 items-center">
            <h1 className="text-lg font-semibold text-gray-900">Data Penimbangan</h1>
          </div>

          {/* FILTER */}

          <div className="flex shrink-0 items-center gap-4">
            {/* DATE FILTER */}

            <div className="w-[220px]">
              <div className="flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2">
                <span className="text-xs font-medium text-gray-600">Tanggal</span>

                <DatePicker
                  value={searchDate}
                  onChange={(value) => {
                    setSearchDate(value);
                  }}
                  className="w-36 [&_input]:h-7 [&_input]:py-0"
                />
              </div>
            </div>

            {/* RECORD COUNT */}

            <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Scale size={15} />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-gray-900">{weighingData.length}</span>

                <span className="text-xs text-gray-500">Data</span>
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
            <div className="text-sm text-gray-500">Memuat data penimbangan...</div>
          ) : weighingData.length === 0 ? (
            <div className="text-sm text-gray-500">Belum ada data penimbangan.</div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {weighingData.map((data, index) => (
                <div
                  key={data.id}
                  className="group relative rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-300 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5"
                >
                  {/* NUMBER */}

                  <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-700 shadow-md transition-all duration-300 group-hover:border-blue-500 group-hover:bg-blue-600 group-hover:text-white">
                    {index + 1}
                  </div>

                  {/* CARD HEADER */}

                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-100">
                      <Scale size={22} strokeWidth={2} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-900">Data Penimbangan</p>

                      <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                        <CalendarDays size={13} />

                        <span>{formatDateDisplay(data.tanggal)}</span>
                      </div>

                      <div className="mt-1 text-xs text-gray-500">
                        Toleransi {Number(data.toleransi).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  <div className="my-2 h-px bg-gray-100" />

                  {/* BUTTONS */}

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(data)}
                      className="flex-1 border-gray-300 bg-transparent text-gray-700 hover:border-gray-400 hover:bg-gray-100 hover:text-gray-900 !outline-none !ring-0 !ring-offset-0 focus:!outline-none focus:!ring-0 focus:!ring-offset-0 focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0"
                    >
                      Lihat
                    </Button>

                    <Button
                      variant="warning"
                      size="sm"
                      className="flex-1 !outline-none !ring-0 !ring-offset-0 focus:!outline-none focus:!ring-0 focus:!ring-offset-0 focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0 hover:bg-blue-600"
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
        title={modalTitle}
        size="6xl"
        footer={
          selectedData && (
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-6">
              {/* EXPORT EXCEL */}

              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => {
                  if (selectedData) {
                    exportToExcel(selectedData);
                  }
                }}
              >
                <FileSpreadsheet size={15} className="mr-2" />
                Export Excel
              </Button>

              {/* TOLERANSI */}

              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <span className="text-xs text-gray-500">Toleransi</span>

                <span className="text-xs font-semibold text-gray-800">
                  ±{Number(selectedData.toleransi).toFixed(2)}%
                </span>
              </div>

              {/* ALL */}

              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <span className="text-xs text-gray-500">Semua</span>

                <span className="text-xs font-semibold text-gray-900">
                  {selectedData.data.length}
                </span>
              </div>

              {/* MERAH */}

              <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                <span className="text-xs text-red-700">Merah</span>

                <span className="text-xs font-semibold text-red-700">
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

              <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                <span className="text-xs text-emerald-700">Hijau</span>

                <span className="text-xs font-semibold text-emerald-700">
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

              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <span className="text-xs text-gray-600">Putih</span>

                <span className="text-xs font-semibold text-gray-800">
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
                [&::-webkit-scrollbar-track]:bg-gray-100
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-gray-300
                hover:[&::-webkit-scrollbar-thumb]:bg-gray-400
                [&::-webkit-scrollbar-button]:hidden
              "
            >
              <table className="w-full min-w-[1050px] border-collapse text-center text-xs">
                {/* =================================================
                    TABLE HEADER
                ================================================== */}

                <thead className="sticky top-0 z-20 bg-gray-100 shadow-sm">
                  <tr className="border-b border-gray-200">
                    <th className="px-2.5 py-3 text-center font-semibold text-gray-700">No</th>

                    <th className="px-2.5 py-3 text-center font-semibold text-gray-700">
                      Lebar Material
                    </th>

                    <th className="px-2.5 py-3 text-center font-semibold text-gray-700">Ukuran</th>

                    <th className="px-2.5 py-3 text-center font-semibold text-gray-700">
                      Ketebalan
                    </th>

                    <th className="px-2.5 py-3 text-center font-semibold text-gray-700">
                      Berat Piece
                    </th>

                    <th className="px-2.5 py-3 text-center font-semibold text-gray-700">
                      Berat Tabel
                    </th>

                    <th className="px-2.5 py-3 text-center font-semibold text-gray-700">
                      +{Number(selectedData.toleransi).toFixed(2)}%
                    </th>

                    <th className="px-2.5 py-3 text-center font-semibold text-gray-700">
                      -{Number(selectedData.toleransi).toFixed(2)}%
                    </th>

                    <th className="px-2.5 py-3 text-center font-semibold text-gray-700">
                      Toleransi
                    </th>

                    <th className="px-2.5 py-3 text-center font-semibold text-gray-700">Warna</th>
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
                    // ============================================

                    const color = calculateColor(pieceWeight, tableWeight, tolerance);

                    const isGreen = color === 'Hijau';
                    const isRed = color === 'Merah';

                    // ============================================
                    // ROW COLOR (Disesuaikan jadi terang / bg-red-100 & bg-emerald-100)
                    // ============================================

                    const rowColorClass = isGreen
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                      : isRed
                        ? 'bg-red-100 text-red-900 border-red-200'
                        : 'bg-white text-gray-800 border-gray-200';

                    // ============================================
                    // BADGE COLOR
                    // ============================================

                    const badgeColorClass = isGreen
                      ? 'bg-emerald-200 text-emerald-800'
                      : isRed
                        ? 'bg-red-200 text-red-800'
                        : 'bg-gray-200 text-gray-700';

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

                        <td className="px-2.5 py-2 font-medium text-red-600">
                          {upperLimit.toFixed(4)}
                        </td>

                        {/* -TOLERANSI */}

                        <td className="px-2.5 py-2 font-medium text-emerald-600">
                          {lowerLimit.toFixed(4)}
                        </td>

                        {/* TOLERANSI */}

                        <td className="px-2.5 py-2 font-medium">±{tolerance.toFixed(2)}%</td>

                        {/* WARNA */}

                        <td className="px-2.5 py-2 font-medium">
                          <span
                            className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold ${badgeColorClass}`}
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
