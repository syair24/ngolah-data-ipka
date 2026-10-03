'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ProductionData {
  id: number;
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
  data: ProductionData[];
}

interface WeightToleranceChartProps {
  data: ApiGroup[];
}

const MONTHS = [
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

function getYear(value: string) {
  return Number(value.slice(0, 4));
}

function getMonth(value: string) {
  return Number(value.slice(5, 7));
}

function getDayLabel(day: number, month: number, year: number) {
  const date = new Date(year, month - 1, day);

  const dayName = date.toLocaleDateString('id-ID', {
    weekday: 'short',
  });

  return `${String(day).padStart(2, '0')} ${dayName}`;
}

export default function WeightToleranceChart({ data }: WeightToleranceChartProps) {
  const latestDate = useMemo(() => {
    return (
      data
        .map((group) => group.tanggalISO)
        .filter(Boolean)
        .sort((a, b) => b.localeCompare(a))[0] || ''
    );
  }, [data]);

  const availableYears = useMemo(() => {
    const years = data.map((group) => getYear(group.tanggalISO)).filter((year) => year > 0);

    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [data]);

  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedYear, setSelectedYear] = useState(0);

  // Otomatis memilih bulan dan tahun dari data terbaru.
  useEffect(() => {
    if (!latestDate) return;

    setSelectedMonth(getMonth(latestDate));
    setSelectedYear(getYear(latestDate));
  }, [latestDate]);

  const daysInMonth =
    selectedMonth > 0 && selectedYear > 0 ? new Date(selectedYear, selectedMonth, 0).getDate() : 0;

  const monthlyGroups = useMemo(() => {
    return data.filter((group) => {
      const date = group.tanggalISO;

      return getMonth(date) === selectedMonth && getYear(date) === selectedYear;
    });
  }, [data, selectedMonth, selectedYear]);

  // Membuat seluruh tanggal dalam bulan terpilih.
  const chartData = useMemo(() => {
    const dailyData = Array.from({ length: daysInMonth }, (_, index) => ({
      hari: index + 1,
      diAtas: 0,
      diBawah: 0,
      sesuai: 0,
    }));

    monthlyGroups.forEach((group) => {
      const day = Number(group.tanggalISO.slice(8, 10));

      if (day < 1 || day > daysInMonth) return;

      const current = dailyData[day - 1];

      group.data.forEach((item) => {
        if (item.warna === 'Merah') {
          current.diAtas += 1;
        } else if (item.warna === 'Hijau') {
          current.diBawah += 1;
        } else {
          current.sesuai += 1;
        }
      });
    });

    return dailyData;
  }, [monthlyGroups, daysInMonth]);

  const totalMerah = chartData.reduce((total, item) => total + item.diAtas, 0);

  const totalHijau = chartData.reduce((total, item) => total + item.diBawah, 0);

  const totalPutih = chartData.reduce((total, item) => total + item.sesuai, 0);

  const totalData = totalMerah + totalHijau + totalPutih;

  const hasData = totalData > 0;

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Weight Tolerance Analytics</h3>

          <p className="mt-1 text-sm text-gray-500">
            Tren harian hasil penimbangan berdasarkan status toleransi
          </p>

          <p className="mt-2 text-xs font-medium text-blue-600">
            Periode: {selectedMonth > 0 ? MONTHS[selectedMonth - 1] : '-'} {selectedYear || '-'}
          </p>
        </div>

        {/* Filter Bulan dan Tahun */}
        <div className="flex items-end gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2.5">
          <div className="w-36">
            <label className="mb-1.5 block text-xs font-medium text-gray-500">Bulan</label>

            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(Number(event.target.value))}
              className="h-10 w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 outline-none transition hover:border-gray-300 focus:border-gray-300 focus:ring-0 focus:outline-none"
            >
              {MONTHS.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div className="w-28">
            <label className="mb-1.5 block text-xs font-medium text-gray-500">Tahun</label>

            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
              className="h-10 w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 outline-none transition hover:border-gray-300 focus:border-gray-300 focus:ring-0 focus:outline-none"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}

              {!availableYears.includes(selectedYear) && selectedYear > 0 && (
                <option value={selectedYear}>{selectedYear}</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="flex h-[320px] flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-gray-600">
            Belum ada data pada bulan yang dipilih.
          </p>

          <p className="mt-1 text-xs text-gray-400">Silakan pilih bulan atau tahun lain.</p>
        </div>
      ) : (
        <>
          {/* Chart */}
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%" style={{ outline: 'none' }}>
              <LineChart
                data={chartData}
                margin={{
                  top: 15,
                  right: 15,
                  left: 0,
                  bottom: 25,
                }}
                style={{ outline: 'none' }}
                tabIndex={-1}
              >
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" vertical={true} />

                <XAxis
                  dataKey="hari"
                  type="number"
                  domain={[1, daysInMonth]}
                  ticks={Array.from({ length: daysInMonth }, (_, index) => index + 1)}
                  interval={0}
                  tickFormatter={(value) => getDayLabel(Number(value), selectedMonth, selectedYear)}
                  tick={{
                    fill: '#6b7280',
                    fontSize: 10,
                  }}
                  axisLine={{
                    stroke: '#d1d5db',
                  }}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={65}
                  label={{
                    value: 'Tanggal',
                    position: 'insideBottom',
                    offset: -2,
                    fill: '#9ca3af',
                    fontSize: 11,
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fill: '#6b7280',
                    fontSize: 12,
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                />

                <Tooltip
                  labelFormatter={(label) =>
                    `Tanggal ${getDayLabel(
                      Number(label),
                      selectedMonth,
                      selectedYear
                    )} ${selectedYear}`
                  }
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                  labelStyle={{
                    color: '#111827',
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                  formatter={(value, name) => [`${value ?? 0} data`, name]}
                />

                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: '12px',
                    paddingBottom: '20px',
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="diAtas"
                  name="Di atas toleransi (+%)"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{
                    r: 3,
                    fill: '#ef4444',
                    strokeWidth: 1,
                  }}
                  activeDot={{ r: 5 }}
                />

                <Line
                  type="monotone"
                  dataKey="diBawah"
                  name="Di bawah toleransi (-%)"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{
                    r: 3,
                    fill: '#10b981',
                    strokeWidth: 1,
                  }}
                  activeDot={{ r: 5 }}
                />

                <Line
                  type="monotone"
                  dataKey="sesuai"
                  name="Sesuai toleransi"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{
                    r: 3,
                    fill: '#8b5cf6',
                    strokeWidth: 1,
                  }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Keterangan Periode */}
          <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-500">
              Periode grafik:
              <span className="ml-1 font-semibold text-gray-700">
                {MONTHS[selectedMonth - 1]} {selectedYear}
              </span>
            </p>

            <p className="text-xs text-gray-400">{daysInMonth} hari</p>
          </div>

          {/* Summary */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Total Data</p>

              <p className="mt-1 text-xl font-semibold text-gray-900">
                {totalData.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="rounded-lg border border-red-100 bg-red-50 p-3">
              <p className="text-xs text-red-600">Di atas toleransi</p>

              <p className="mt-1 text-xl font-semibold text-red-600">
                {totalMerah.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
              <p className="text-xs text-emerald-700">Di bawah toleransi</p>

              <p className="mt-1 text-xl font-semibold text-emerald-700">
                {totalHijau.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="rounded-lg border border-violet-100 bg-violet-50 p-3">
              <p className="text-xs text-violet-700">Sesuai toleransi</p>

              <p className="mt-1 text-xl font-semibold text-violet-700">
                {totalPutih.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
