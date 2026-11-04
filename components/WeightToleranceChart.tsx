"use client";

import { useMemo, useState } from "react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ProductionData {
  id: number;
  lebarMaterial: number;
  ukuran: string;
  ketebalan: number;
  beratPiece: number;
  beratTabel: number;
  toleransi: number;
  warna: "Hijau" | "Putih" | "Merah";
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
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function getYear(value: string) {
  return Number(value.slice(0, 4));
}

function getMonth(value: string) {
  return Number(value.slice(5, 7));
}

function getDayLabel(day: number, month: number, year: number) {
  const date = new Date(year, month - 1, day);

  const dayName = date.toLocaleDateString("id-ID", {
    weekday: "short",
  });

  return `${String(day).padStart(2, "0")} ${dayName}`;
}

export default function WeightToleranceChart({
  data,
}: WeightToleranceChartProps) {
  // ============================================================
  // TANGGAL TERBARU
  // ============================================================

  const latestDate = useMemo(() => {
    return (
      data
        .map((group) => group.tanggalISO)
        .filter(Boolean)
        .sort((a, b) => b.localeCompare(a))[0] || ""
    );
  }, [data]);

  // ============================================================
  // TAHUN TERSEDIA
  // ============================================================

  const availableYears = useMemo(() => {
    const years = data
      .map((group) => getYear(group.tanggalISO))
      .filter((year) => year > 0);

    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [data]);

  const [filterSelection, setFilterSelection] = useState(() => ({
    latestDate,
    month: latestDate ? getMonth(latestDate) : 0,
    year: latestDate ? getYear(latestDate) : 0,
  }));

  const selectedMonth =
    filterSelection.latestDate === latestDate
      ? filterSelection.month
      : latestDate
        ? getMonth(latestDate)
        : 0;

  const selectedYear =
    filterSelection.latestDate === latestDate
      ? filterSelection.year
      : latestDate
        ? getYear(latestDate)
        : 0;

  // ============================================================
  // JUMLAH HARI DALAM BULAN
  // ============================================================

  const daysInMonth =
    selectedMonth > 0 && selectedYear > 0
      ? new Date(selectedYear, selectedMonth, 0).getDate()
      : 0;

  // ============================================================
  // FILTER GROUP SESUAI BULAN DAN TAHUN
  // ============================================================

  const monthlyGroups = useMemo(() => {
    return data.filter((group) => {
      const date = group.tanggalISO;

      if (!date) return false;

      return getMonth(date) === selectedMonth && getYear(date) === selectedYear;
    });
  }, [data, selectedMonth, selectedYear]);

  // ============================================================
  // DATA PER HARI
  // ============================================================

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
        if (item.warna === "Merah") {
          current.diAtas += 1;
        } else if (item.warna === "Hijau") {
          current.diBawah += 1;
        } else {
          current.sesuai += 1;
        }
      });
    });

    return dailyData;
  }, [monthlyGroups, daysInMonth]);

  // ============================================================
  // TOTAL DATA PER KATEGORI (BULAN TERPILIH)
  // ============================================================

  const totalMerah = chartData.reduce((total, item) => total + item.diAtas, 0);

  const totalHijau = chartData.reduce((total, item) => total + item.diBawah, 0);

  const totalPutih = chartData.reduce((total, item) => total + item.sesuai, 0);

  const totalData = totalMerah + totalHijau + totalPutih;

  // ============================================================
  // SEMUA DATA DARI API / DATABASE YANG DITERIMA KOMPONEN
  // ============================================================

  const totalSemuaData = useMemo(() => {
    return data.reduce((total, group) => {
      return total + group.data.length;
    }, 0);
  }, [data]);

  const hasData = totalData > 0;

  // ============================================================
  // MAX DATA UNTUK SCALE Y-AXIS
  // ============================================================

  const maxDailyValue = useMemo(() => {
    if (chartData.length === 0) return 0;

    return Math.max(
      ...chartData.map((item) =>
        Math.max(item.diAtas, item.diBawah, item.sesuai),
      ),
    );
  }, [chartData]);

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

  // ============================================================
  // PERSENTASE
  // ============================================================

  const percentageMerah = totalData > 0 ? (totalMerah / totalData) * 100 : 0;

  const percentageHijau = totalData > 0 ? (totalHijau / totalData) * 100 : 0;

  const percentagePutih = totalData > 0 ? (totalPutih / totalData) * 100 : 0;

  return (
    <div className="mt-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* HEADER */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Weight Tolerance Analytics
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Grafik harian hasil penimbangan berdasarkan status toleransi
          </p>

          <p className="mt-2 text-xs font-medium text-blue-600">
            Periode: {selectedMonth > 0 ? MONTHS[selectedMonth - 1] : "-"}{" "}
            {selectedYear || "-"}
          </p>
        </div>

        {/* FILTER */}
        <div className="flex items-end gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2.5">
          <div className="w-36">
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              Bulan
            </label>

            <select
              value={selectedMonth}
              onChange={(event) =>
                setFilterSelection({
                  latestDate,
                  month: Number(event.target.value),
                  year: selectedYear,
                })
              }
              className="h-10 w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 outline-none transition hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              {MONTHS.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div className="w-28">
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              Tahun
            </label>

            <select
              value={selectedYear}
              onChange={(event) =>
                setFilterSelection({
                  latestDate,
                  month: selectedMonth,
                  year: Number(event.target.value),
                })
              }
              className="h-10 w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 outline-none transition hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
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

      {/* EMPTY STATE */}
      {!hasData ? (
        <div className="flex h-96 flex-col items-center justify-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <span className="text-xl text-gray-400">—</span>
          </div>

          <p className="text-sm font-medium text-gray-600">
            Belum ada data pada bulan yang dipilih.
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Silakan pilih bulan atau tahun lain.
          </p>
        </div>
      ) : (
        <>
          {/* GRAFIK GABUNGAN 3 AREA */}
          <div className="rounded-2xl border border-gray-100 bg-gradient-to-b from-gray-50/80 to-white p-3 sm:p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-800">
                  Statistik Penimbangan Harian
                </h4>

                <p className="mt-1 text-xs text-gray-400">
                  Perbandingan seluruh kategori toleransi
                </p>
              </div>

              <div className="rounded-lg border border-gray-100 bg-white px-3 py-1.5 shadow-sm">
                <span className="text-xs text-gray-500">
                  Total:{" "}
                  <span className="font-bold text-gray-800">
                    {totalData.toLocaleString("id-ID")}
                  </span>
                </span>
              </div>
            </div>

            <div className="h-80 w-full sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{
                    top: 15,
                    right: 15,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <defs>
                    {/* GRADASI MERAH */}
                    <linearGradient
                      id="colorDiAtas"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#ef4444"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor="#ef4444"
                        stopOpacity={0.01}
                      />
                    </linearGradient>

                    {/* GRADASI HIJAU */}
                    <linearGradient
                      id="colorDiBawah"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#10b981"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0.01}
                      />
                    </linearGradient>

                    {/* GRADASI UNGU */}
                    <linearGradient
                      id="colorSesuai"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#8b5cf6"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor="#8b5cf6"
                        stopOpacity={0.01}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#e5e7eb"
                    strokeDasharray="4 5"
                    vertical={false}
                  />

                  {/* TANGGAL MIRING */}
                  <XAxis
                    dataKey="hari"
                    type="number"
                    domain={[1, daysInMonth]}
                    ticks={Array.from(
                      { length: daysInMonth },
                      (_, index) => index + 1,
                    )}
                    interval={0}
                    tickFormatter={(value) =>
                      getDayLabel(Number(value), selectedMonth, selectedYear)
                    }
                    tick={{
                      fill: "#9ca3af",
                      fontSize: 10,
                      textAnchor: "end",
                    }}
                    angle={-45}
                    height={65}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={12}
                  />

                  <YAxis
                    domain={[0, yAxisMax]}
                    allowDecimals={false}
                    tick={{
                      fill: "#9ca3af",
                      fontSize: 11,
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
                        selectedYear,
                      )} ${selectedYear}`
                    }
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
                      padding: "12px 14px",
                      fontSize: "12px",
                    }}
                    labelStyle={{
                      color: "#111827",
                      fontWeight: 700,
                      marginBottom: 8,
                    }}
                    formatter={(value, name) => [
                      `${Number(value ?? 0).toLocaleString("id-ID")} data`,
                      name,
                    ]}
                  />

                  {/* AREA MERAH */}
                  <Area
                    type="monotone"
                    dataKey="diAtas"
                    name="Di atas toleransi"
                    stroke="#ef4444"
                    strokeWidth={3}
                    fill="url(#colorDiAtas)"
                    fillOpacity={1}
                    activeDot={{
                      r: 6,
                      stroke: "#ffffff",
                      strokeWidth: 2,
                    }}
                    dot={{
                      r: 3,
                      fill: "#ef4444",
                      stroke: "#ffffff",
                      strokeWidth: 1.5,
                    }}
                    animationDuration={1000}
                  />

                  {/* AREA HIJAU */}
                  <Area
                    type="monotone"
                    dataKey="diBawah"
                    name="Di bawah toleransi"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="url(#colorDiBawah)"
                    fillOpacity={1}
                    activeDot={{
                      r: 6,
                      stroke: "#ffffff",
                      strokeWidth: 2,
                    }}
                    dot={{
                      r: 3,
                      fill: "#10b981",
                      stroke: "#ffffff",
                      strokeWidth: 1.5,
                    }}
                    animationDuration={1200}
                  />

                  {/* AREA UNGU */}
                  <Area
                    type="monotone"
                    dataKey="sesuai"
                    name="Sesuai toleransi"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fill="url(#colorSesuai)"
                    fillOpacity={1}
                    activeDot={{
                      r: 6,
                      stroke: "#ffffff",
                      strokeWidth: 2,
                    }}
                    dot={{
                      r: 3,
                      fill: "#8b5cf6",
                      stroke: "#ffffff",
                      strokeWidth: 1.5,
                    }}
                    animationDuration={1400}
                  />

                  <Legend content={() => null} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* LEGENDA WARNA DI BAWAH GRAFIK */}
            <div className="mt-5 grid grid-cols-1 gap-3 border-t border-gray-100 pt-5 sm:grid-cols-3">
              {/* MERAH */}
              <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50/70 p-3">
                <div className="h-10 w-1.5 rounded-full bg-red-500" />

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-red-600">
                    Di atas toleransi
                  </p>

                  <p className="mt-0.5 text-lg font-bold text-red-700">
                    {totalMerah.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="rounded-lg bg-red-100 px-2 py-1">
                  <span className="text-xs font-semibold text-red-700">
                    {percentageMerah.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* HIJAU */}
              <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                <div className="h-10 w-1.5 rounded-full bg-emerald-500" />

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-emerald-600">
                    Di bawah toleransi
                  </p>

                  <p className="mt-0.5 text-lg font-bold text-emerald-700">
                    {totalHijau.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="rounded-lg bg-emerald-100 px-2 py-1">
                  <span className="text-xs font-semibold text-emerald-700">
                    {percentageHijau.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* UNGU */}
              <div className="flex items-center gap-3 rounded-xl border border-violet-100 bg-violet-50/70 p-3">
                <div className="h-10 w-1.5 rounded-full bg-violet-500" />

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-violet-600">
                    Sesuai toleransi
                  </p>

                  <p className="mt-0.5 text-lg font-bold text-violet-700">
                    {totalPutih.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="rounded-lg bg-violet-100 px-2 py-1">
                  <span className="text-xs font-semibold text-violet-700">
                    {percentagePutih.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
