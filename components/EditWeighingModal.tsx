'use client';

import { useEffect, useState } from 'react';

import { Save, X } from 'lucide-react';

import Button from '@/components/Button';
import Modal from '@/components/Modal';

// =========================================================
// INTERFACES
// =========================================================

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
  user: {
    id: number;
    username: string;
    email: string;
  } | null;
  data: WeighingItem[];
}

interface EditWeighingModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WeighingCard | null;
  onSave: (data: WeighingCard) => Promise<void>;
}

type NumericField = 'lebarMaterial' | 'ketebalan' | 'beratPiece' | 'beratTabel';

type EditableItem = Omit<WeighingItem, NumericField> & Record<NumericField, string>;

type EditableCard = Omit<WeighingCard, 'data'> & {
  data: EditableItem[];
};

// =========================================================
// HELPER
// =========================================================

function parseNumericValue(value: string | number): number {
  if (typeof value === 'number') return value;

  const normalized = String(value).trim().replace(',', '.');

  if (!normalized) return NaN;

  return Number(normalized);
}

function truncateTwoDecimals(value: number): number {
  return Math.trunc(value * 100) / 100;
}

function calculateColor(
  pieceWeight: number,
  tableWeight: number,
  tolerance: number
): 'Hijau' | 'Putih' | 'Merah' {
  const upper = tableWeight + (tableWeight * tolerance) / 100;
  const lower = tableWeight - (tableWeight * tolerance) / 100;

  const piece = truncateTwoDecimals(pieceWeight);

  if (piece < truncateTwoDecimals(lower)) {
    return 'Hijau';
  }

  if (piece > truncateTwoDecimals(upper)) {
    return 'Merah';
  }

  return 'Putih';
}

function formatTwoDecimals(value: number | string): string {
  const number = parseNumericValue(value);

  if (!Number.isFinite(number)) return '0.00';

  return number.toFixed(2);
}

// =========================================================
// COMPONENT
// =========================================================

export default function EditWeighingModal({
  isOpen,
  onClose,
  data,
  onSave,
}: EditWeighingModalProps) {
  const [draft, setDraft] = useState<EditableCard | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // =========================================================
  // CHECK DATA CHANGES
  // =========================================================

  const isDirty = (() => {
    if (!draft || !data) return false;

    if (
      draft.tanggal !== data.tanggal ||
      draft.toleransi !== data.toleransi ||
      draft.data.length !== data.data.length
    ) {
      return true;
    }

    return draft.data.some((item, index) => {
      const originalItem = data.data[index];

      if (!originalItem) return true;

      return (
        item.id !== originalItem.id ||
        item.lebarMaterial !== String(originalItem.lebarMaterial) ||
        item.ukuran !== originalItem.ukuran ||
        item.ketebalan !== String(originalItem.ketebalan) ||
        item.beratPiece !== String(originalItem.beratPiece) ||
        item.beratTabel !== String(originalItem.beratTabel)
      );
    });
  })();

  // =========================================================
  // INITIALIZE DRAFT
  // =========================================================

  useEffect(() => {
    if (isOpen && data) {
      setDraft({
        ...data,
        data: data.data.map((item) => ({
          ...item,
          lebarMaterial: String(item.lebarMaterial),
          ketebalan: String(item.ketebalan),
          beratPiece: String(item.beratPiece),
          beratTabel: String(item.beratTabel),
        })),
      });

      setError('');
    }

    if (!isOpen) {
      setDraft(null);
      setError('');
    }
  }, [isOpen, data]);

  // =========================================================
  // UPDATE ITEM
  // =========================================================

  const updateItem = (id: number, field: keyof WeighingItem, value: string) => {
    setError('');

    setDraft((current) => {
      if (!current) return current;

      return {
        ...current,
        data: current.data.map((item) => {
          if (item.id !== id) return item;

          const updated: EditableItem = {
            ...item,
            [field]: field === 'ukuran' ? value.toUpperCase() : value,
          };

          const piece = parseNumericValue(updated.beratPiece);
          const table = parseNumericValue(updated.beratTabel);
          const tolerance = Number(updated.toleransi);

          if (Number.isFinite(piece) && Number.isFinite(table) && Number.isFinite(tolerance)) {
            updated.warna = calculateColor(piece, table, tolerance);
          }

          return updated;
        }),
      };
    });
  };

  // =========================================================
  // FORMAT FIELD ON BLUR
  // =========================================================

  const formatFieldOnBlur = (id: number, field: NumericField) => {
    setDraft((current) => {
      if (!current) return current;

      return {
        ...current,
        data: current.data.map((item) => {
          if (item.id !== id) return item;

          const value = parseNumericValue(item[field]);

          return {
            ...item,
            [field]: Number.isFinite(value) ? formatTwoDecimals(value) : '',
          };
        }),
      };
    });
  };

  // =========================================================
  // COUNT COLOR
  // =========================================================

  const countColor = (color: string) =>
    draft?.data.filter((item) => {
      const piece = parseNumericValue(item.beratPiece);
      const table = parseNumericValue(item.beratTabel);
      const tolerance = Number(item.toleransi);

      if (!Number.isFinite(piece) || !Number.isFinite(table) || !Number.isFinite(tolerance)) {
        return false;
      }

      return calculateColor(piece, table, tolerance) === color;
    }).length ?? 0;

  // =========================================================
  // SAVE
  // =========================================================

  const handleSave = async () => {
    if (!draft || saving || !isDirty) return;

    setError('');

    if (draft.data.length === 0) {
      setError('Data penimbangan tidak boleh kosong.');
      return;
    }

    const hasEmptyData = draft.data.some((item) => {
      const requiredValues = [
        item.lebarMaterial,
        item.ukuran,
        item.ketebalan,
        item.beratPiece,
        item.beratTabel,
      ];

      return requiredValues.some((value) => String(value).trim() === '');
    });

    if (hasEmptyData) {
      setError('Semua kolom wajib diisi. Tidak boleh ada data yang kosong.');
      return;
    }

    const normalizedData: WeighingCard = {
      ...draft,
      data: draft.data.map((item) => {
        const lebarMaterial = parseNumericValue(item.lebarMaterial);
        const ketebalan = parseNumericValue(item.ketebalan);
        const beratPiece = parseNumericValue(item.beratPiece);
        const beratTabel = parseNumericValue(item.beratTabel);
        const toleransi = Number(item.toleransi);

        const warna =
          Number.isFinite(beratPiece) && Number.isFinite(beratTabel) && Number.isFinite(toleransi)
            ? calculateColor(beratPiece, beratTabel, toleransi)
            : item.warna;

        return {
          ...item,
          lebarMaterial,
          ketebalan,
          beratPiece,
          beratTabel,
          warna,
        };
      }),
    };

    const hasInvalidData = normalizedData.data.some((item) =>
      [item.lebarMaterial, item.ketebalan, item.beratPiece, item.beratTabel, item.toleransi].some(
        (value) => !Number.isFinite(value) || value < 0
      )
    );

    if (hasInvalidData) {
      setError('Pastikan semua nilai angka valid dan tidak negatif.');
      return;
    }

    const hasInvalidSize = normalizedData.data.some((item) => !item.ukuran.trim());

    if (hasInvalidSize) {
      setError('Ukuran wajib diisi.');
      return;
    }

    setSaving(true);

    try {
      await onSave(normalizedData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // INPUT STYLE
  // =========================================================

  const inputClass =
    'w-full min-w-0 rounded-md border border-gray-300 bg-white px-1 py-1.5 text-center text-xs text-gray-800 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500';

  // =========================================================
  // NUMERIC INPUT
  // =========================================================

  const numericInput = (item: EditableItem, field: NumericField, emphasized = false) => (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={item[field]}
      onChange={(e) => updateItem(item.id, field, e.target.value)}
      onBlur={() => formatFieldOnBlur(item.id, field)}
      className={`${inputClass} ${emphasized ? 'font-semibold' : ''}`}
    />
  );

  if (!draft) return null;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Modal
      isOpen={isOpen}
      onClose={saving ? () => {} : onClose}
      title={`Edit Data Penimbangan - ${draft.tanggal}`}
      size="6xl"
      closeOnOverlayClick={!saving}
      showCloseButton={!saving}
      footer={
        <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-lg bg-gray-100 px-3 py-2 text-gray-700">
              Total: <b>{draft.data.length}</b>
            </span>

            <span className="rounded-lg bg-red-50 px-3 py-2 text-red-700">
              Merah: <b>{countColor('Merah')}</b>
            </span>

            <span className="rounded-lg bg-green-50 px-3 py-2 text-green-700">
              Hijau: <b>{countColor('Hijau')}</b>
            </span>

            <span className="rounded-lg bg-gray-100 px-3 py-2 text-gray-700">
              Putih: <b>{countColor('Putih')}</b>
            </span>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
              <X size={15} className="mr-1.5" />
              Batal
            </Button>

            <Button
              variant="primary"
              size="sm"
              isLoading={saving}
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={15} className="mr-1.5" />
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="-m-6 flex h-[calc(85vh-73px-76px)] min-h-0 flex-col">
        <div
          className="
            min-w-0
            flex-1
            overflow-y-auto
            overflow-x-hidden
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:bg-gray-100
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-gray-300
            hover:[&::-webkit-scrollbar-thumb]:bg-gray-400
            [&::-webkit-scrollbar-button]:hidden
          "
        >
          <table className="w-full table-fixed border-collapse text-center text-xs">
            <colgroup>
              <col style={{ width: '5%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '8%' }} />
            </colgroup>

            <thead className="sticky top-0 z-20 bg-gray-100 shadow-sm">
              <tr className="border-b border-gray-200">
                {[
                  'No',
                  'Lebar Material',
                  'Ukuran',
                  'Ketebalan',
                  'Berat Piece',
                  'Berat Tabel',
                  '+ Toleransi',
                  '- Toleransi',
                  'Toleransi',
                  'Warna',
                ].map((heading) => (
                  <th
                    key={heading}
                    className="whitespace-normal break-words px-1 py-3 text-[11px] font-semibold text-gray-700"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {[...draft.data].reverse().map((item, index) => {
                const tolerance = Number(item.toleransi);

                const tableWeight = parseNumericValue(item.beratTabel);

                const pieceWeight = parseNumericValue(item.beratPiece);

                const upper = tableWeight + (tableWeight * tolerance) / 100;

                const lower = tableWeight - (tableWeight * tolerance) / 100;

                const validCalculation =
                  Number.isFinite(tolerance) &&
                  Number.isFinite(tableWeight) &&
                  Number.isFinite(pieceWeight);

                const color = validCalculation
                  ? calculateColor(pieceWeight, tableWeight, tolerance)
                  : 'Putih';

                // ROW COLOR

                const rowClass =
                  color === 'Hijau'
                    ? 'bg-green-50 text-green-900 border-gray-100'
                    : color === 'Merah'
                      ? 'bg-red-50 text-red-900 border-gray-100'
                      : 'bg-white text-gray-800 border-gray-100';

                // BADGE COLOR

                const badgeClass =
                  color === 'Hijau'
                    ? 'bg-green-100 text-green-800'
                    : color === 'Merah'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-700';

                return (
                  <tr key={item.id} className={`border-b last:border-b-0 ${rowClass}`}>
                    <td className="px-1 py-2 text-[11px] font-medium">{index + 1}</td>

                    <td className="px-1 py-2">{numericInput(item, 'lebarMaterial')}</td>

                    <td className="px-1 py-2">
                      <input
                        type="text"
                        value={item.ukuran}
                        onChange={(e) => updateItem(item.id, 'ukuran', e.target.value)}
                        className={inputClass}
                      />
                    </td>

                    <td className="px-1 py-2">{numericInput(item, 'ketebalan')}</td>

                    <td className="px-1 py-2">{numericInput(item, 'beratPiece', true)}</td>

                    <td className="px-1 py-2">{numericInput(item, 'beratTabel')}</td>

                    <td className="px-1 py-2 text-[10px] font-medium text-red-600">
                      {validCalculation ? upper.toFixed(4) : '-'}
                    </td>

                    <td className="px-1 py-2 text-[10px] font-medium text-green-700">
                      {validCalculation ? lower.toFixed(4) : '-'}
                    </td>

                    <td className="px-1 py-2 text-[10px]">
                      ±{Number.isFinite(tolerance) ? tolerance.toFixed(2) : '-'}%
                    </td>

                    <td className="px-1 py-2">
                      <span
                        className={`inline-flex justify-center rounded-md px-1.5 py-1 text-[10px] font-semibold ${badgeClass}`}
                      >
                        {validCalculation ? color : '-'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {error && (
          <div
            role="alert"
            className="border-t border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
          >
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
