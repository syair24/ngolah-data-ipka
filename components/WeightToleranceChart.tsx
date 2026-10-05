'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  LabelList,
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

function getStatusLabel(warna: ProductionData['warna']) {
  if (warna === 'Merah') {
    return 'Di atas toleransi';
  }

  if (warna === 'Hijau') {
    return 'Di bawah toleransi';
  }

  return 'Sesuai toleransi';
}

export default function WeightToleranceChart({ data }: WeightToleranceChartProps) {
  /*
   * ============================================================
   * TANGGAL TERBARU
   * ============================================================
   */
  const latestDate = useMemo(() => {
    return (
      data
        .map((group) => group.tanggalISO)
        .filter(Boolean)
        .sort((a, b) => b.localeCompare(a))[0] || ''
    );
  }, [data]);

  /*
   * ============================================================
   * TAHUN TERSEDIA
   * ============================================================
   */
  const availableYears = useMemo(() => {
    const years = data.map((group) => getYear(group.tanggalISO)).filter((year) => year > 0);

    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [data]);

  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedYear, setSelectedYear] = useState(0);

  /*
   * ============================================================
   * SET FILTER BERDASARKAN DATA TERBARU
   * ============================================================
   */
  useEffect(() => {
    if (!latestDate) return;

    setSelectedMonth(getMonth(latestDate));
    setSelectedYear(getYear(latestDate));
  }, [latestDate]);

  /*
   * ============================================================
   * JUMLAH HARI DALAM BULAN
   * ============================================================
   */
  const daysInMonth =
    selectedMonth > 0 && selectedYear > 0 ? new Date(selectedYear, selectedMonth, 0).getDate() : 0;

  /*
   * ============================================================
   * FILTER GROUP SESUAI BULAN DAN TAHUN
   * ============================================================
   */
  const monthlyGroups = useMemo(() => {
    return data.filter((group) => {
      const date = group.tanggalISO;

      if (!date) return false;

      return getMonth(date) === selectedMonth && getYear(date) === selectedYear;
    });
  }, [data, selectedMonth, selectedYear]);

  /*
   * ============================================================
   * DATA PER HARI
   * ============================================================
   */
  const chartData = useMemo(() => {
    const dailyData = Array.from({ length: daysInMonth }, (_, index) => ({
      hari: index + 1,
      diAtas: 0,
      diBawah: 0,
      sesuai: 0,
    }));

    monthlyGroups.forEach((group) => {
      const day = Number(group.tanggalISO.slice(8, 10));

      if (day < 1 || day > daysInMonth) {
        return;
      }

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

  /*
   * ============================================================
   * TOTAL
   * ============================================================
   */
  const totalMerah = chartData.reduce((total, item) => total + item.diAtas, 0);

  const totalHijau = chartData.reduce((total, item) => total + item.diBawah, 0);

  const totalPutih = chartData.reduce((total, item) => total + item.sesuai, 0);

  const totalData = totalMerah + totalHijau + totalPutih;

  const hasData = totalData > 0;

  /*
   * ============================================================
   * MAX DATA UNTUK SCALE Y-AXIS
   * ============================================================
   */
  const maxDailyValue = useMemo(() => {
    if (chartData.length === 0) return 0;

    return Math.max(...chartData.map((item) => Math.max(item.diAtas, item.diBawah, item.sesuai)));
  }, [chartData]);

  /*
   * Tambahkan ruang di atas batang supaya angka tidak terpotong.
   */
  const yAxisMax = useMemo(() => {
    if (maxDailyValue <= 0) return 5;

    if (maxDailyValue <= 5) {
      return maxDailyValue + 2;
    }

    if (maxDailyValue <= 10) {
      return maxDailyValue + 3;
    }

    if (maxDailyValue <= 20) {
      return maxDailyValue + 5;
    }

    return Math.ceil(maxDailyValue * 1.2);
  }, [maxDailyValue]);

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* ======================================================
          HEADER
      ====================================================== */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Weight Tolerance Analytics</h3>

          <p className="mt-1 text-sm text-gray-500">
            Grafik harian hasil penimbangan berdasarkan status toleransi
          </p>

          <p className="mt-2 text-xs font-medium text-blue-600">
            Periode: {selectedMonth > 0 ? MONTHS[selectedMonth - 1] : '-'} {selectedYear || '-'}
          </p>
        </div>

        {/* ====================================================
            FILTER
        ==================================================== */}
        <div className="flex items-end gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2.5">
          <div className="w-36">
            <label className="mb-1.5 block text-xs font-medium text-gray-500">Bulan</label>

            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(Number(event.target.value))}
              className="h-10 w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 outline-none transition hover:border-gray-300 focus:border-gray-300 focus:outline-none focus:ring-0"
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
              className="h-10 w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 outline-none transition hover:border-gray-300 focus:border-gray-300 focus:outline-none focus:ring-0"
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

      {/* ======================================================
          EMPTY STATE
      ====================================================== */}
      {!hasData ? (
        <div className="flex h-[380px] flex-col items-center justify-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <span className="text-xl text-gray-400">—</span>
          </div>

          <p className="text-sm font-medium text-gray-600">
            Belum ada data pada bulan yang dipilih.
          </p>

          <p className="mt-1 text-xs text-gray-400">Silakan pilih bulan atau tahun lain.</p>
        </div>
      ) : (
        <>
          {/* ==================================================
              CHART
          ================================================== */}
          <div className="h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 30,
                  right: 20,
                  left: 5,
                  bottom: 35,
                }}
                barGap={2}
                barCategoryGap="18%"
              >
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" vertical={false} />

                {/* ==================================================
                    X AXIS
                ================================================== */}
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
                  height={75}
                  label={{
                    value: 'Tanggal',
                    position: 'insideBottom',
                    offset: -8,
                    fill: '#9ca3af',
                    fontSize: 11,
                  }}
                />

                {/* ==================================================
                    Y AXIS
                ================================================== */}
                <YAxis
                  domain={[0, yAxisMax]}
                  allowDecimals={false}
                  tick={{
                    fill: '#6b7280',
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  label={{
                    value: 'Jumlah Data',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#9ca3af',
                    fontSize: 11,
                  }}
                />

                {/* ==================================================
                    TOOLTIP
                ================================================== */}
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
                    borderRadius: '10px',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
                    fontSize: '12px',
                    padding: '10px 12px',
                  }}
                  labelStyle={{
                    color: '#111827',
                    fontWeight: 600,
                    marginBottom: 7,
                  }}
                  itemStyle={{
                    padding: '2px 0',
                  }}
                  formatter={(value, name) => [
                    `${Number(value ?? 0).toLocaleString('id-ID')} data`,
                    name,
                  ]}
                />

                {/* ==================================================
                    LEGEND
                ================================================== */}
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: '12px',
                    paddingBottom: '25px',
                  }}
                />

                {/* ==================================================
                    BAR DI ATAS TOLERANSI
                ================================================== */}
                <Bar
                  dataKey="diAtas"
                  name="Di atas toleransi (+%)"
                  fill="#ef4444"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={28}
                >
                  <LabelList
                    dataKey="diAtas"
                    position="top"
                    formatter={(value) => (Number(value) > 0 ? value : '')}
                    fill="#dc2626"
                    fontSize={10}
                    fontWeight={600}
                  />
                </Bar>

                {/* ==================================================
                    BAR DI BAWAH TOLERANSI
                ================================================== */}
                <Bar
                  dataKey="diBawah"
                  name="Di bawah toleransi (-%)"
                  fill="#10b981"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={28}
                >
                  <LabelList
                    dataKey="diBawah"
                    position="top"
                    formatter={(value) => (Number(value) > 0 ? value : '')}
                    fill="#059669"
                    fontSize={10}
                    fontWeight={600}
                  />
                </Bar>

                {/* ==================================================
                    BAR SESUAI TOLERANSI
                ================================================== */}
                <Bar
                  dataKey="sesuai"
                  name="Sesuai toleransi"
                  fill="#8b5cf6"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={28}
                >
                  <LabelList
                    dataKey="sesuai"
                    position="top"
                    formatter={(value) => (Number(value) > 0 ? value : '')}
                    fill="#7c3aed"
                    fontSize={10}
                    fontWeight={600}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ======================================================
              INFO PERIODE
          ====================================================== */}
          <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-3">
            <div>
              <p className="text-xs text-gray-500">
                Periode grafik:
                <span className="ml-1 font-semibold text-gray-700">
                  {MONTHS[selectedMonth - 1]} {selectedYear}
                </span>
              </p>
            </div>

            <p className="text-xs text-gray-400">{daysInMonth} hari</p>
          </div>

          {/* ======================================================
              SUMMARY CARDS
          ====================================================== */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* TOTAL */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-500">Total Data</p>

                <span className="text-xs font-medium text-gray-400">ALL</span>
              </div>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {totalData.toLocaleString('id-ID')}
              </p>

              <p className="mt-1 text-xs text-gray-400">Seluruh data periode</p>
            </div>

            {/* MERAH */}
            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-red-600">Di atas toleransi</p>

                <span className="h-2 w-2 rounded-full bg-red-500" />
              </div>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {totalMerah.toLocaleString('id-ID')}
              </p>

              <p className="mt-1 text-xs text-red-400">Melebihi batas toleransi</p>
            </div>

            {/* HIJAU */}
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-emerald-700">Di bawah toleransi</p>

                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>

              <p className="mt-2 text-2xl font-bold text-emerald-700">
                {totalHijau.toLocaleString('id-ID')}
              </p>

              <p className="mt-1 text-xs text-emerald-500">Di bawah batas toleransi</p>
            </div>

            {/* PUTIH */}
            <div className="rounded-xl border border-violet-100 bg-violet-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-violet-700">Sesuai toleransi</p>

                <span className="h-2 w-2 rounded-full bg-violet-500" />
              </div>

              <p className="mt-2 text-2xl font-bold text-violet-700">
                {totalPutih.toLocaleString('id-ID')}
              </p>

              <p className="mt-1 text-xs text-violet-500">Berada dalam batas toleransi</p>
            </div>
          </div>

          {/* ======================================================
              DETAIL PERSENTASE
          ====================================================== */}
          {totalData > 0 && (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-700">Distribusi Data</p>

                <p className="text-xs text-gray-400">
                  Total {totalData.toLocaleString('id-ID')} data
                </p>
              </div>

              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                {totalMerah > 0 && (
                  <div
                    className="bg-red-500 transition-all"
                    style={{
                      width: `${(totalMerah / totalData) * 100}%`,
                    }}
                  />
                )}

                {totalHijau > 0 && (
                  <div
                    className="bg-emerald-500 transition-all"
                    style={{
                      width: `${(totalHijau / totalData) * 100}%`,
                    }}
                  />
                )}

                {totalPutih > 0 && (
                  <div
                    className="bg-violet-500 transition-all"
                    style={{
                      width: `${(totalPutih / totalData) * 100}%`,
                    }}
                  />
                )}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[11px] text-gray-400">Di atas</p>

                  <p className="text-sm font-semibold text-red-600">
                    {((totalMerah / totalData) * 100).toFixed(1)}%
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-gray-400">Di bawah</p>

                  <p className="text-sm font-semibold text-emerald-600">
                    {((totalHijau / totalData) * 100).toFixed(1)}%
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-gray-400">Sesuai</p>

                  <p className="text-sm font-semibold text-violet-600">
                    {((totalPutih / totalData) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
