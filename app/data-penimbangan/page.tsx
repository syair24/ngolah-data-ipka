'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, FileSpreadsheet, Pencil, Scale } from 'lucide-react';

import Button from '@/components/Button';
import Modal from '@/components/Modal';
import DatePicker from '@/components/DatePicker';
import EditWeighingModal from '@/components/EditWeighingModal';
import Navbar from '@/components/Navbar';
import { useSidebar } from '@/app/layout';

import { exportToExcel } from '@/lib/exportExcel';

import {
  type WeighingCard,
  calculateColor,
  formatDateDisplay,
} from '@/lib/dataPenimbangan-helpers';

export default function WeighingDataPage() {
  const { isSidebarOpen } = useSidebar();

  const [weighingData, setWeighingData] = useState<WeighingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchDate, setSearchDate] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCatatanModalOpen, setIsCatatanModalOpen] = useState(false);
  const [catatanText, setCatatanText] = useState('');
  const [savingCatatan, setSavingCatatan] = useState(false);

  const [selectedData, setSelectedData] = useState<WeighingCard | null>(null);
  const [selectedEditData, setSelectedEditData] = useState<WeighingCard | null>(null);
  const [selectedCatatanData, setSelectedCatatanData] = useState<WeighingCard | null>(null);

  const [error, setError] = useState('');

  // =========================================================
  // FETCH DATA
  // =========================================================

  useEffect(() => {
    const controller = new AbortController();

    const fetchWeighingData = async () => {
      try {
        setLoading(true);
        setError('');

        const url = searchDate
          ? `/api/data-penimbangan?tanggal=${encodeURIComponent(searchDate)}`
          : '/api/data-penimbangan';

        const response = await fetch(url, {
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Gagal mengambil data');
        }

        const result: WeighingCard[] = await response.json();

        setWeighingData(result);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        console.error('FETCH WEIGHING DATA ERROR:', error);

        setWeighingData([]);
        setError('Gagal mengambil data penimbangan.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchWeighingData();

    return () => {
      controller.abort();
    };
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
  // EDIT
  // =========================================================

  const handleEdit = (data: WeighingCard) => {
    setSelectedEditData(data);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    if (saving) return;

    setIsEditModalOpen(false);
    setSelectedEditData(null);
  };

  // =========================================================
  // EDIT CATATAN
  // =========================================================

  const handleEditCatatan = (data: WeighingCard) => {
    const firstItem = data.data[0] as (typeof data.data)[number] & { catatan?: string | null };
    setSelectedCatatanData(data);
    setCatatanText(String(firstItem?.catatan ?? ''));
    setIsCatatanModalOpen(true);
  };

  const handleCloseCatatanModal = () => {
    if (savingCatatan) return;
    setIsCatatanModalOpen(false);
    setSelectedCatatanData(null);
    setCatatanText('');
  };

  const handleSaveCatatan = async () => {
    if (!selectedCatatanData) return;

    const firstItem = selectedCatatanData.data[0];
    if (!firstItem) {
      setError('Data penimbangan tidak ditemukan.');
      return;
    }

    try {
      setSavingCatatan(true);
      setError('');

      const response = await fetch('/api/data-penimbangan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateCatatan',
          id: firstItem.id,
          catatan: catatanText,
        }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error || result?.message || 'Gagal menyimpan catatan.');
      }

      const url = searchDate
        ? `/api/data-penimbangan?tanggal=${encodeURIComponent(searchDate)}`
        : '/api/data-penimbangan';
      const refreshResponse = await fetch(url, { cache: 'no-store' });
      if (!refreshResponse.ok) {
        throw new Error('Catatan tersimpan, tetapi daftar gagal dimuat ulang.');
      }

      setWeighingData(await refreshResponse.json());
      setIsCatatanModalOpen(false);
      setSelectedCatatanData(null);
      setCatatanText('');
    } catch (error) {
      console.error('SAVE CATATAN ERROR:', error);
      setError(
        error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan catatan.'
      );
    } finally {
      setSavingCatatan(false);
    }
  };

  // =========================================================
  // SAVE EDIT
  // =========================================================

  const handleSaveEdit = async (updatedData: WeighingCard) => {
    try {
      setSaving(true);
      setError('');

      const response = await fetch('/api/data-penimbangan', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: updatedData.id,
          tanggal: updatedData.tanggal,
          toleransi: updatedData.toleransi,
          data: updatedData.data.map((item) => ({
            id: item.id,
            lebarMaterial: item.lebarMaterial,
            ukuran: item.ukuran,
            ketebalan: item.ketebalan,
            beratPiece: item.beratPiece,
            beratTabel: item.beratTabel,
            toleransi: item.toleransi,
          })),
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);

        throw new Error(result?.error || result?.message || 'Gagal menyimpan perubahan data.');
      }

      const url = searchDate
        ? `/api/data-penimbangan?tanggal=${encodeURIComponent(searchDate)}`
        : '/api/data-penimbangan';

      const refreshResponse = await fetch(url, {
        cache: 'no-store',
      });

      if (!refreshResponse.ok) {
        throw new Error('Data berhasil diperbarui, tetapi gagal memuat ulang data.');
      }

      const refreshedData: WeighingCard[] = await refreshResponse.json();

      setWeighingData(refreshedData);
      setIsEditModalOpen(false);
      setSelectedEditData(null);
    } catch (error) {
      console.error('SAVE EDIT ERROR:', error);

      setError(
        error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan perubahan.'
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE ALL
  // =========================================================
  const handleDeleteAll = async (selectedData: WeighingCard) => {
    const ids = selectedData.data.map((item) => item.id);

    if (ids.length === 0) {
      throw new Error('Tidak ada data yang bisa dihapus.');
    }

    const response = await fetch('/api/data-penimbangan', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tanggal: selectedData.tanggal,
        ids,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Gagal menghapus data.');
    }

    // Muat ulang daftar setelah data berhasil dihapus.
    const url = searchDate
      ? `/api/data-penimbangan?tanggal=${encodeURIComponent(searchDate)}`
      : '/api/data-penimbangan';

    const refreshResponse = await fetch(url, {
      cache: 'no-store',
    });

    if (!refreshResponse.ok) {
      throw new Error('Data berhasil dihapus, tetapi daftar gagal diperbarui. Muat ulang halaman.');
    }

    setWeighingData(await refreshResponse.json());
    setSelectedEditData(null);
    setIsEditModalOpen(false);
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
    <div
      className={`min-h-screen bg-gray-50 transition-[padding] duration-200 ease-in-out ${
        isSidebarOpen ? 'md:pl-5' : 'md:pl-5'
      }`}
    >
      {/* NAVBAR REUSABLE */}
      <Navbar title="Data Penimbangan">
        <div className="flex shrink-0 items-center gap-4">
          <div className="w-55">
            <div className="flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2">
              <span className="text-xs font-medium text-gray-600">Tanggal</span>

              <DatePicker
                value={searchDate}
                onChange={setSearchDate}
                className="w-36 [&_input]:h-7 [&_input]:py-0"
              />
            </div>
          </div>

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
      </Navbar>

      {/* MAIN */}
      <main className="pt-23 pr-5">
        <div className="w-full">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-sm text-gray-500">Memuat data penimbangan...</div>
          ) : weighingData.length === 0 ? (
            <div className="text-sm text-gray-500">Belum ada data penimbangan.</div>
          ) : (
            <div className="flex w-full flex-col gap-4">
              {weighingData.map((data, index) => {
                const firstItem = data.data[0];
                const catatan =
                  firstItem && 'catatan' in firstItem ? String(firstItem.catatan ?? '').trim() : '';

                return (
                  <div
                    key={data.id}
                    className="group relative flex w-full flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex min-w-0 items-start gap-3 sm:min-w-75 sm:flex-1">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-300 group-hover:bg-blue-100">
                          <Scale size={22} strokeWidth={2} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">Data Penimbangan</p>
                            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-gray-200 bg-gray-50 px-2 text-xs font-semibold text-gray-600">
                              {index + 1}
                            </span>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays size={13} />
                              {formatDateDisplay(data.tanggal)}
                            </span>
                            <span>Toleransi {Number(data.toleransi).toFixed(0)}%</span>
                            <span>
                              Admin:{' '}
                              <span className="font-semibold text-gray-700">
                                {data.user?.username || 'Sistem'}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="min-w-0 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 sm:w-[38%] sm:max-w-130">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                          Catatan
                        </p>
                        <p className="mt-1 whitespace-pre-wrap wrap-break-word text-sm text-gray-700">
                          {catatan || '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-end gap-2 sm:ml-6">
                      <Button
                        type="button"
                        onClick={() => handleView(data)}
                        className="min-w-24 border border-gray-300 bg-transparent px-4 py-2 text-gray-700 hover:border-gray-400 hover:bg-gray-100 hover:text-gray-900"
                      >
                        Lihat
                      </Button>

                      <Button
                        type="button"
                        onClick={() => handleEdit(data)}
                        className="min-w-24 border border-orange-400 bg-orange-400 px-4 py-2 text-white hover:border-orange-500 hover:bg-orange-500"
                      >
                        Edit
                      </Button>

                      <Button
                        type="button"
                        onClick={() => handleEditCatatan(data)}
                        className="min-w-32 border border-blue-400 bg-blue-500 px-4 py-2 text-white hover:border-blue-500 hover:bg-blue-600"
                      >
                        <Pencil size={14} className="mr-2" />
                        Edit Catatan
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* MODAL VIEW */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalTitle}
        size="6xl"
        footer={
          selectedData && (
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-6">
              <Button
                type="button"
                className="rounded-md border border-emerald-600 bg-emerald-600 px-3 py-2 text-white hover:border-emerald-700 hover:bg-emerald-700"
                onClick={() => {
                  exportToExcel({
                    ...selectedData,
                    data: [...selectedData.data].reverse(),
                  });
                }}
              >
                <FileSpreadsheet size={15} className="mr-2" />
                Export Excel
              </Button>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <span className="text-xs text-gray-500">Toleransi</span>

                <span className="text-xs font-semibold text-gray-800">
                  ±{Number(selectedData.toleransi).toFixed(2)}%
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <span className="text-xs text-gray-500">Semua</span>

                <span className="text-xs font-semibold text-gray-900">
                  {selectedData.data.length}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                <span className="text-xs text-red-700">Merah</span>

                <span className="text-xs font-semibold text-red-700">
                  {
                    selectedData.data.filter(
                      (item) =>
                        calculateColor(
                          Number(item.beratPiece),
                          Number(item.beratTabel),
                          Number(item.toleransi)
                        ) === 'Merah'
                    ).length
                  }
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                <span className="text-xs text-green-700">Hijau</span>

                <span className="text-xs font-semibold text-green-700">
                  {
                    selectedData.data.filter(
                      (item) =>
                        calculateColor(
                          Number(item.beratPiece),
                          Number(item.beratTabel),
                          Number(item.toleransi)
                        ) === 'Hijau'
                    ).length
                  }
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <span className="text-xs text-gray-600">Putih</span>

                <span className="text-xs font-semibold text-gray-800">
                  {
                    selectedData.data.filter(
                      (item) =>
                        calculateColor(
                          Number(item.beratPiece),
                          Number(item.beratTabel),
                          Number(item.toleransi)
                        ) === 'Putih'
                    ).length
                  }
                </span>
              </div>
            </div>
          )
        }
      >
        {selectedData && (
          <div className="-m-6 flex h-[calc(85vh-73px-76px)] flex-col">
            <div className="relative flex-1 overflow-x-auto overflow-y-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-button]:hidden">
              <table className="w-full min-w-262.5 border-collapse text-center text-xs">
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

                <tbody>
                  {[...selectedData.data].reverse().map((item, index) => {
                    const tolerance = Number(item.toleransi);
                    const tableWeight = Number(item.beratTabel);
                    const pieceWeight = Number(item.beratPiece);

                    const upperLimit = tableWeight + (tableWeight * tolerance) / 100;
                    const lowerLimit = tableWeight - (tableWeight * tolerance) / 100;

                    const color = calculateColor(pieceWeight, tableWeight, tolerance);

                    const isGreen = color === 'Hijau';
                    const isRed = color === 'Merah';

                    const rowColorClass = isGreen
                      ? 'bg-green-50 text-green-900 border-gray-100'
                      : isRed
                        ? 'bg-red-50 text-red-900 border-gray-100'
                        : 'bg-white text-gray-800 border-gray-100';

                    const badgeColorClass = isGreen
                      ? 'bg-green-100 text-green-800'
                      : isRed
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-700';

                    return (
                      <tr key={item.id} className={`border-b last:border-b-0 ${rowColorClass}`}>
                        <td className="px-2.5 py-2 font-medium">{index + 1}</td>
                        <td className="px-2.5 py-2 font-medium">
                          {Math.round(Number(item.lebarMaterial))}
                        </td>
                        <td className="px-2.5 py-2 font-medium">{item.ukuran}</td>
                        <td className="px-2.5 py-2 font-medium">
                          {Number(item.ketebalan).toFixed(2)}
                        </td>
                        <td className="px-2.5 py-2 font-semibold">{pieceWeight.toFixed(2)}</td>
                        <td className="px-2.5 py-2 font-medium">{tableWeight.toFixed(2)}</td>
                        <td className="px-2.5 py-2 font-medium text-red-600">
                          {upperLimit.toFixed(4)}
                        </td>
                        <td className="px-2.5 py-2 font-medium text-green-700">
                          {lowerLimit.toFixed(4)}
                        </td>
                        <td className="px-2.5 py-2 font-medium">±{tolerance.toFixed(2)}%</td>
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

      {/* MODAL EDIT */}
      <EditWeighingModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        data={selectedEditData}
        onSave={handleSaveEdit}
        onDeleteAll={handleDeleteAll}
      />

      {/* MODAL EDIT CATATAN */}
      <Modal
        isOpen={isCatatanModalOpen}
        onClose={handleCloseCatatanModal}
        title={
          selectedCatatanData
            ? `Edit Catatan - ${formatDateDisplay(selectedCatatanData.tanggal)}`
            : 'Edit Catatan'
        }
        size="lg"
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button
              type="button"
              onClick={handleCloseCatatanModal}
              disabled={savingCatatan}
              className="border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSaveCatatan}
              disabled={savingCatatan}
              className="border border-blue-600 bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              {savingCatatan ? 'Menyimpan...' : 'Simpan Catatan'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <label htmlFor="catatan-penimbangan" className="block text-sm font-medium text-gray-700">
            Catatan Penimbangan
          </label>
          <textarea
            id="catatan-penimbangan"
            value={catatanText}
            onChange={(event) => setCatatanText(event.target.value)}
            rows={5}
            placeholder="Tulis catatan di sini..."
            disabled={savingCatatan}
            className="w-full resize-y rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
          />
          <p className="text-xs text-gray-500">
            Catatan akan disimpan pada data penimbangan yang dipilih.
          </p>
        </div>
      </Modal>
    </div>
  );
}
