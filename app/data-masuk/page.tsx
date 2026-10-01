'use client';

import { useMemo, useRef, useState } from 'react';

import { Plus, RotateCcw, Save, Trash2, GripVertical } from 'lucide-react';

import Button from '@/components/Button';
import Modal from '@/components/Modal';
import DatePicker from '@/components/DatePicker';

interface InputItem {
  id: string;
  materialWidth: string;
  size: string;
  thickness: string;
  pieceWeight: string;
  tableWeight: string;
}

type InputField = 'materialWidth' | 'size' | 'thickness' | 'pieceWeight' | 'tableWeight';

const createRowId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export default function InputDataPage() {
  const [data, setData] = useState<InputItem[]>([]);
  const [date, setDate] = useState<string>('');
  const [tolerance, setTolerance] = useState<string>('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // MODAL SAVE
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // MODAL RESET
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const autoScrollRef = useRef<number | null>(null);
  const dragClientYRef = useRef<number | null>(null);

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const toleranceValue = Number(tolerance) || 0;

  const recordsCount = useMemo(() => data.length, [data]);

  // =========================================================
  // INPUT HELPERS
  // =========================================================

  const normalizeNumberInput = (value: string) => {
    return value
      .replace(/,/g, '.')
      .replace(/[^\d.]/g, '')
      .replace(/(\..*)\./g, '$1');
  };

  const normalizeSizeInput = (value: string) => {
    return value.toUpperCase();
  };

  const isValidNonNegativeNumber = (value: string) => {
    if (value.trim() === '') {
      return false;
    }

    const number = Number(value);

    return Number.isFinite(number) && number >= 0;
  };

  // =========================================================
  // POTONG 2 ANGKA
  // =========================================================

  const truncateToTwoDecimals = (value: number) => {
    return Math.trunc(value * 100) / 100;
  };

  // =========================================================
  // ROW
  // =========================================================

  const addRow = () => {
    setData((prev) => [
      ...prev,
      {
        id: createRowId(),
        materialWidth: '',
        size: '',
        thickness: '',
        pieceWeight: '',
        tableWeight: '',
      },
    ]);

    setSaveError('');
  };

  const removeRow = (index: number) => {
    setData((prev) => prev.filter((_, i) => i !== index));
    setSaveError('');
  };

  const resetData = () => {
    setData([]);
    setSaveError('');
  };

  // =========================================================
  // RESET CONFIRMATION
  // =========================================================

  const handleResetClick = () => {
    if (data.length === 0) {
      return;
    }

    setIsResetConfirmOpen(true);
  };

  const confirmReset = () => {
    resetData();
    setIsResetConfirmOpen(false);
  };

  // =========================================================
  // UPDATE ROW
  // =========================================================

  const updateRow = (index: number, field: keyof Omit<InputItem, 'id'>, value: string) => {
    setData((prev) =>
      prev.map((item, i) => {
        if (i !== index) {
          return item;
        }

        return {
          ...item,
          [field]: value,
        };
      })
    );

    setSaveError('');
  };

  // =========================================================
  // FOCUS INPUT
  // =========================================================

  const focusInput = (rowIndex: number, field: InputField) => {
    requestAnimationFrame(() => {
      const row = data[rowIndex];

      if (!row) {
        return;
      }

      const input = inputRefs.current[`${row.id}-${field}`];

      if (input) {
        input.focus();
        input.select();
      }
    });
  };

  // =========================================================
  // ENTER KEY
  // =========================================================

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    field: InputField
  ) => {
    if (e.key !== 'Enter') {
      return;
    }

    e.preventDefault();

    if (field === 'materialWidth') {
      focusInput(rowIndex, 'size');
      return;
    }

    if (field === 'size') {
      focusInput(rowIndex, 'thickness');
      return;
    }

    if (field === 'thickness') {
      focusInput(rowIndex, 'pieceWeight');
      return;
    }

    if (field === 'pieceWeight') {
      focusInput(rowIndex, 'tableWeight');
      return;
    }

    if (field === 'tableWeight') {
      const newRowId = createRowId();

      setData((prev) => [
        ...prev,
        {
          id: newRowId,
          materialWidth: '',
          size: '',
          thickness: '',
          pieceWeight: '',
          tableWeight: '',
        },
      ]);

      setSaveError('');

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const input = inputRefs.current[`${newRowId}-materialWidth`];

          input?.focus();
        });
      });
    }
  };

  // =========================================================
  // SAVE DATA
  // =========================================================

  const saveData = async () => {
    setSaveError('');

    if (!date) {
      setSaveError('Tanggal wajib diisi.');
      return;
    }

    if (tolerance.trim() === '' || !isValidNonNegativeNumber(tolerance)) {
      setSaveError('Toleransi wajib diisi dan tidak boleh minus.');
      return;
    }

    if (data.length === 0) {
      setSaveError('Belum ada data untuk disimpan.');
      return;
    }

    for (let index = 0; index < data.length; index++) {
      const item = data[index];

      if (item.materialWidth.trim() === '') {
        setSaveError(`Lebar Material pada baris ${index + 1} wajib diisi.`);
        return;
      }

      if (item.size.trim() === '') {
        setSaveError(`Ukuran pada baris ${index + 1} wajib diisi.`);
        return;
      }

      if (item.thickness.trim() === '') {
        setSaveError(`Ketebalan pada baris ${index + 1} wajib diisi.`);
        return;
      }

      if (item.pieceWeight.trim() === '') {
        setSaveError(`Berat Piece pada baris ${index + 1} wajib diisi.`);
        return;
      }

      if (item.tableWeight.trim() === '') {
        setSaveError(`Berat Tabel pada baris ${index + 1} wajib diisi.`);
        return;
      }

      if (!isValidNonNegativeNumber(item.materialWidth)) {
        setSaveError(`Lebar Material pada baris ${index + 1} tidak valid.`);
        return;
      }

      if (!isValidNonNegativeNumber(item.thickness)) {
        setSaveError(`Ketebalan pada baris ${index + 1} tidak valid.`);
        return;
      }

      if (!isValidNonNegativeNumber(item.pieceWeight)) {
        setSaveError(`Berat Piece pada baris ${index + 1} tidak valid.`);
        return;
      }

      if (!isValidNonNegativeNumber(item.tableWeight)) {
        setSaveError(`Berat Tabel pada baris ${index + 1} tidak valid.`);
        return;
      }
    }

    try {
      setIsSaving(true);

      const payload = {
        date,
        tolerance: Number(tolerance),

        data: data.map((item) => ({
          materialWidth: Number(normalizeNumberInput(item.materialWidth)),

          size: item.size.toUpperCase(),

          thickness: Number(normalizeNumberInput(item.thickness)),

          pieceWeight: Number(normalizeNumberInput(item.pieceWeight)),

          tableWeight: Number(normalizeNumberInput(item.tableWeight)),
        })),
      };

      const response = await fetch('/api/data-masuk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || result?.success === false) {
        throw new Error(result?.error || 'Gagal menyimpan data.');
      }

      setData([]);
      setIsConfirmOpen(false);
    } catch (error) {
      console.error('Gagal save data masuk:', error);

      setSaveError(error instanceof Error ? error.message : 'Gagal menyimpan data ke database.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClick = () => {
    setSaveError('');

    if (!date) {
      setSaveError('Tanggal wajib diisi.');
      return;
    }

    if (tolerance.trim() === '' || !isValidNonNegativeNumber(tolerance)) {
      setSaveError('Toleransi wajib diisi dan tidak boleh minus.');
      return;
    }

    if (data.length === 0) {
      setSaveError('Belum ada data untuk disimpan.');
      return;
    }

    setIsConfirmOpen(true);
  };

  // =========================================================
  // DRAG & DROP
  // =========================================================

  const stopAutoScroll = () => {
    dragClientYRef.current = null;

    if (autoScrollRef.current !== null) {
      cancelAnimationFrame(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  };

  const startAutoScroll = (clientY: number) => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    dragClientYRef.current = clientY;

    if (autoScrollRef.current !== null) {
      return;
    }

    const scroll = () => {
      const currentContainer = scrollContainerRef.current;
      const currentClientY = dragClientYRef.current;

      if (!currentContainer || currentClientY === null) {
        autoScrollRef.current = null;
        return;
      }

      const rect = currentContainer.getBoundingClientRect();
      const edgeSize = 120;
      const maxSpeed = 18;

      let speed = 0;

      if (currentClientY < rect.top + edgeSize) {
        const distance = rect.top + edgeSize - currentClientY;
        const progress = Math.min(distance / edgeSize, 1);
        speed = -Math.max(2, Math.round(progress * progress * maxSpeed));
      } else if (currentClientY > rect.bottom - edgeSize) {
        const distance = currentClientY - (rect.bottom - edgeSize);
        const progress = Math.min(distance / edgeSize, 1);
        speed = Math.max(2, Math.round(progress * progress * maxSpeed));
      }

      if (speed !== 0) {
        currentContainer.scrollTop += speed;
      }

      autoScrollRef.current = requestAnimationFrame(scroll);
    };

    autoScrollRef.current = requestAnimationFrame(scroll);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));

    const row = e.currentTarget.closest('tr');

    if (!row) {
      return;
    }

    const rowRect = row.getBoundingClientRect();
    const handleRect = e.currentTarget.getBoundingClientRect();

    const previewTable = document.createElement('table');
    previewTable.style.position = 'absolute';
    previewTable.style.top = '-9999px';
    previewTable.style.left = '-9999px';
    previewTable.style.width = `${rowRect.width}px`;
    previewTable.style.borderCollapse = 'collapse';
    previewTable.style.background = '#ffffff';
    previewTable.style.color = '#111827';
    previewTable.style.fontSize = '12px';

    const previewRow = row.cloneNode(true) as HTMLTableRowElement;
    previewTable.appendChild(previewRow);
    document.body.appendChild(previewTable);

    const handleX = handleRect.left - rowRect.left + handleRect.width / 2;
    const handleY = handleRect.top - rowRect.top + handleRect.height / 2;

    e.dataTransfer.setDragImage(previewTable, handleX, handleY);

    requestAnimationFrame(() => {
      previewTable.remove();
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropIndex(index);
    startAutoScroll(e.clientY);
  };

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    e.preventDefault();
    stopAutoScroll();

    const sourceIndex = dragIndex;

    if (sourceIndex === null || sourceIndex === index) {
      setDragIndex(null);
      setDropIndex(null);
      return;
    }

    setData((prev) => {
      const newData = [...prev];
      const [movedItem] = newData.splice(sourceIndex, 1);
      newData.splice(index, 0, movedItem);
      return newData;
    });

    setDragIndex(null);
    setDropIndex(null);
  };

  const handleDragEnd = () => {
    stopAutoScroll();
    setDragIndex(null);
    setDropIndex(null);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="fixed inset-0 h-screen w-full overflow-hidden bg-gray-50 text-gray-900">
      {/* HEADER */}
      <header className="fixed left-55 right-0 top-0 z-50 h-16 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex h-full items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-900">Data Masuk</h1>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
              <span className="text-xs font-medium text-gray-700">Tanggal</span>
              <DatePicker
                value={date}
                onChange={setDate}
                placeholder="Pilih Tanggal"
                className="w-36 [&_input]:h-7 [&_input]:py-0"
              />
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
              <span className="text-xs font-medium text-gray-700">Toleransi</span>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={tolerance}
                  onChange={(e) => {
                    const value = normalizeNumberInput(e.target.value);
                    setTolerance(value);
                    setSaveError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                      e.preventDefault();
                    }
                  }}
                  className="h-7 w-16 rounded-lg border border-gray-300 bg-white px-2 text-center text-xs text-gray-900 outline-none transition focus:border-blue-600"
                />
                <span className="text-xs text-gray-500">%</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2">
              <span className="text-xs text-blue-600">Data</span>
              <span className="text-sm font-semibold text-blue-700">{recordsCount}</span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetClick}
              className="h-9 gap-2 rounded-xl border-orange-200 bg-orange-50 px-3.5 text-xs font-medium text-orange-600 hover:border-orange-300 hover:bg-orange-100 hover:text-orange-700"
            >
              <RotateCcw size={14} />
              Reset
            </Button>

            <Button
              type="button"
              onClick={handleSaveClick}
              variant="outline"
              size="sm"
              disabled={isSaving}
              className="!h-9 !gap-2 !rounded-xl !border-emerald-200 !bg-emerald-50 !px-3.5 !text-xs !font-medium !text-emerald-600 hover:!border-emerald-300 hover:!bg-emerald-100 hover:!text-emerald-700"
            >
              <Save size={15} />
              {isSaving ? 'Menyimpan...' : 'Simpan Data'}
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={addRow}
              className="h-9 gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-500"
            >
              <Plus size={15} strokeWidth={2.5} />
              Tambah Data
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="fixed bottom-0 left-55 right-0 top-16 overflow-hidden bg-gray-50 p-3 text-gray-900">
        <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div
            ref={scrollContainerRef}
            className="min-h-0 flex-1 overflow-auto [scrollbar-color:rgb(203_213_225)_rgb(255_255_255)] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-white [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-white [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
          >
            <table className="w-full table-fixed text-center text-xs">
              <colgroup>
                <col className="w-[4%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[7%]" />
                <col className="w-[7%]" />
                <col className="w-[8%]" />
                <col className="w-[6%]" />
              </colgroup>

              <thead className="sticky top-0 z-20 bg-gray-100">
                <tr className="border-b border-gray-200 text-gray-700">
                  <th className="px-2 py-3 font-medium">No</th>
                  <th className="px-2 py-3 font-medium">Lebar Material</th>
                  <th className="px-2 py-3 font-medium">Ukuran</th>
                  <th className="px-2 py-3 font-medium">Ketebalan</th>
                  <th className="px-2 py-3 font-medium">Berat Piece</th>
                  <th className="px-2 py-3 font-medium">Berat Tabel</th>
                  <th className="px-2 py-3 font-medium">+Toleransi</th>
                  <th className="px-2 py-3 font-medium">-Toleransi</th>
                  <th className="px-2 py-3 font-medium">Warna</th>
                  <th className="px-2 py-3 font-medium">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {data.map((item, index) => {
                  const tableWeight = Number(normalizeNumberInput(item.tableWeight)) || 0;
                  const pieceWeight = Number(normalizeNumberInput(item.pieceWeight)) || 0;

                  const upperLimit = tableWeight + (tableWeight * toleranceValue) / 100;
                  const lowerLimit = tableWeight - (tableWeight * toleranceValue) / 100;

                  const truncatedPiece = truncateToTwoDecimals(pieceWeight);
                  const truncatedUpper = truncateToTwoDecimals(upperLimit);
                  const truncatedLower = truncateToTwoDecimals(lowerLimit);

                  let color = 'Putih';
                  let colorClass = 'border-gray-200 bg-gray-50 text-gray-700';

                  if (item.pieceWeight !== '' && item.tableWeight !== '') {
                    if (truncatedPiece > truncatedUpper) {
                      // Lebih dari batas atas (+) -> Merah
                      color = 'Merah';
                      colorClass = 'border-red-200 bg-red-50 text-red-700 ';
                    } else if (truncatedPiece < truncatedLower) {
                      // Kurang dari batas bawah (-) -> Hijau
                      color = 'Hijau';
                      colorClass = 'border-emerald-200 bg-emerald-50 text-emerald-700';
                    } else {
                      // Di dalam rentang -> Putih
                      color = 'Putih';
                      colorClass = 'border-gray-200 bg-gray-50 text-gray-700';
                    }
                  }

                  const rowClass =
                    color === 'Merah' ? 'bg-red-100' : color === 'Hijau' ? 'bg-emerald-100' : '';

                  const isDropTarget = dropIndex === index && dragIndex !== index;

                  return (
                    <tr
                      key={item.id}
                      draggable={false}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragLeave={() => {
                        if (dropIndex === index) {
                          setDropIndex(null);
                        }
                      }}
                      className={`border-b border-gray-200 transition-colors ${rowClass} ${
                        isDropTarget ? 'border-y-2 border-dashed border-blue-500 bg-blue-50/50' : ''
                      }`}
                    >
                      <td className="px-2 py-2 text-gray-500">{index + 1}</td>

                      <td className="px-2 py-2">
                        <input
                          ref={(element) => {
                            inputRefs.current[`${item.id}-materialWidth`] = element;
                          }}
                          type="text"
                          inputMode="decimal"
                          value={item.materialWidth}
                          onChange={(e) =>
                            updateRow(index, 'materialWidth', normalizeNumberInput(e.target.value))
                          }
                          onKeyDown={(e) => handleInputKeyDown(e, index, 'materialWidth')}
                          className="h-8 w-[85%] max-w-20 rounded-lg border border-gray-300 bg-white px-1.5 text-center text-xs text-gray-900 outline-none transition focus:border-blue-600"
                        />
                      </td>

                      <td className="px-2 py-2">
                        <input
                          ref={(element) => {
                            inputRefs.current[`${item.id}-size`] = element;
                          }}
                          type="text"
                          value={item.size}
                          onChange={(e) =>
                            updateRow(index, 'size', normalizeSizeInput(e.target.value))
                          }
                          onKeyDown={(e) => handleInputKeyDown(e, index, 'size')}
                          className="h-8 w-[85%] max-w-20 rounded-lg border border-gray-300 bg-white px-1.5 text-center text-xs text-gray-900 outline-none transition focus:border-blue-600"
                        />
                      </td>

                      <td className="px-2 py-2">
                        <input
                          ref={(element) => {
                            inputRefs.current[`${item.id}-thickness`] = element;
                          }}
                          type="text"
                          inputMode="decimal"
                          value={item.thickness}
                          onChange={(e) =>
                            updateRow(index, 'thickness', normalizeNumberInput(e.target.value))
                          }
                          onKeyDown={(e) => handleInputKeyDown(e, index, 'thickness')}
                          className="h-8 w-[85%] max-w-20 rounded-lg border border-gray-300 bg-white px-1.5 text-center text-xs text-gray-900 outline-none transition focus:border-blue-600"
                        />
                      </td>

                      <td className="px-2 py-2">
                        <input
                          ref={(element) => {
                            inputRefs.current[`${item.id}-pieceWeight`] = element;
                          }}
                          type="text"
                          inputMode="decimal"
                          value={item.pieceWeight}
                          onChange={(e) =>
                            updateRow(index, 'pieceWeight', normalizeNumberInput(e.target.value))
                          }
                          onKeyDown={(e) => handleInputKeyDown(e, index, 'pieceWeight')}
                          className="h-8 w-[85%] max-w-20 rounded-lg border border-gray-300 bg-white px-1.5 text-center text-xs text-gray-900 outline-none transition focus:border-blue-600"
                        />
                      </td>

                      <td className="px-2 py-2">
                        <input
                          ref={(element) => {
                            inputRefs.current[`${item.id}-tableWeight`] = element;
                          }}
                          type="text"
                          inputMode="decimal"
                          value={item.tableWeight}
                          onChange={(e) =>
                            updateRow(index, 'tableWeight', normalizeNumberInput(e.target.value))
                          }
                          onKeyDown={(e) => handleInputKeyDown(e, index, 'tableWeight')}
                          className="h-8 w-[85%] max-w-20 rounded-lg border border-gray-300 bg-white px-1.5 text-center text-xs text-gray-900 outline-none transition focus:border-blue-600"
                        />
                      </td>

                      <td className="px-2 py-2 font-medium text-red-600">
                        {upperLimit.toFixed(4)}
                      </td>
                      <td className="px-2 py-2 font-medium text-emerald-600">
                        {lowerLimit.toFixed(4)}
                      </td>

                      <td className="px-2 py-2">
                        <span
                          className={`inline-flex min-w-16 items-center justify-center rounded-lg border px-2 py-1.5 text-xs font-medium ${colorClass}`}
                        >
                          {color}
                        </span>
                      </td>

                      <td className="px-2 py-2">
                        <div className="flex items-center justify-center gap-1.5">
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnd={handleDragEnd}
                            title="Geser untuk mengubah urutan"
                            className="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 transition-colors hover:border-blue-300 hover:bg-gray-100 hover:text-blue-600 active:cursor-grabbing"
                          >
                            <GripVertical size={16} />
                          </div>

                          <Button
                            type="button"
                            onClick={() => removeRow(index)}
                            title="Hapus data"
                            aria-label={`Hapus data baris ${index + 1}`}
                            variant="outline"
                            size="sm"
                            className="!h-8 !w-8 !shrink-0 !rounded-lg !border-red-200 !bg-red-50 !p-0 !text-red-600 hover:!border-red-300 hover:!bg-red-100 hover:!text-red-700"
                          >
                            <Trash2 size={20} strokeWidth={2.2} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {data.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className={`px-2 py-16 text-center text-xs ${
                        saveError ? 'text-red-600' : 'text-gray-500'
                      }`}
                    >
                      {saveError || 'Belum ada data. Klik Tambah Data untuk menambahkan data.'}
                    </td>
                  </tr>
                )}

                {data.length > 0 && saveError && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-2 py-3 text-center text-xs font-medium text-red-600"
                    >
                      {saveError}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-4 border-t border-gray-200 bg-white px-5 py-3">
            <span className={`text-xs ${saveError ? 'text-red-600' : 'text-gray-500'}`}>
              {saveError || 'Data akan tersimpan ke database setelah tombol Simpan Data ditekan.'}
            </span>
            <span className="text-xs font-medium text-gray-700">Total: {data.length}</span>
          </div>
        </div>
      </main>

      {/* MODAL KONFIRMASI SAVE */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        showCloseButton={false}
        closeOnOverlayClick={!isSaving}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isSaving}
            >
              Batal
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              className="!h-9 !gap-2 !rounded-xl !border-emerald-200 !bg-emerald-50 !px-3.5 !text-xs !font-medium !text-emerald-600 hover:!border-emerald-300 hover:!bg-emerald-100 hover:!text-emerald-700"
              disabled={isSaving}
              onClick={async () => {
                await saveData();
              }}
            >
              <Save size={15} />
              {isSaving ? 'Menyimpan...' : 'Ya, Simpan'}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
            <Save size={27} />
          </div>
          <h3 className="mb-3 text-base font-semibold text-gray-900">Konfirmasi Data</h3>
          <p className="max-w-sm text-sm leading-6 text-gray-600">
            Apakah tanggal dan data yang Anda masukkan sudah benar?
          </p>
        </div>
      </Modal>

      {/* MODAL KONFIRMASI RESET */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        showCloseButton={false}
        closeOnOverlayClick={true}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsResetConfirmOpen(false)}
            >
              Batal
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={confirmReset}
              className="!h-9 !gap-2 !rounded-xl !border-orange-200 !bg-orange-50 !px-3.5 !text-xs !font-medium !text-orange-600 hover:!border-orange-300 hover:!bg-orange-100 hover:!text-orange-700"
            >
              <RotateCcw size={15} />
              Ya, Reset
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full border border-orange-200 bg-orange-50 text-orange-600">
            <RotateCcw size={27} />
          </div>
          <h3 className="mb-3 text-base font-semibold text-gray-900">Konfirmasi Reset</h3>
          <p className="max-w-sm text-sm leading-6 text-gray-600">
            Apakah Anda yakin ingin mereset semua data yang sudah dimasukkan?
          </p>
        </div>
      </Modal>
    </div>
  );
}
