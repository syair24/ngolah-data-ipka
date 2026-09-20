'use client';

import Input from '@/components/Input';

import {
  Search,
  Scale,
  Package,
  Weight,
  AlertTriangle,
  CheckCircle2,
  Factory,
  Boxes,
  TrendingUp,
} from 'lucide-react';

interface ProductionData {
  id: number;
  tanggal: string;
  material: 'Pipa' | 'Hollow' | 'Galvanis';
  ukuran: string;
  lebarMaterial: number;
  ketebalan: number;
  beratPiece: number;
  beratTabel: number;
  toleransi: number;
  warna: 'Hijau' | 'Putih' | 'Merah';
}

const dummyData: ProductionData[] = [
  {
    id: 1,
    tanggal: '19 Sep 2026 08:12',
    material: 'Hollow',
    ukuran: '40 x 40',
    lebarMaterial: 40,
    ketebalan: 1.2,
    beratPiece: 8.42,
    beratTabel: 8.5,
    toleransi: 5,
    warna: 'Putih',
  },
  {
    id: 2,
    tanggal: '19 Sep 2026 08:26',
    material: 'Hollow',
    ukuran: '50 x 50',
    lebarMaterial: 50,
    ketebalan: 1.6,
    beratPiece: 11.82,
    beratTabel: 12,
    toleransi: 5,
    warna: 'Putih',
  },
  {
    id: 3,
    tanggal: '19 Sep 2026 09:03',
    material: 'Pipa',
    ukuran: '1 1/2"',
    lebarMaterial: 48.3,
    ketebalan: 2,
    beratPiece: 14.72,
    beratTabel: 14.5,
    toleransi: 5,
    warna: 'Putih',
  },
  {
    id: 4,
    tanggal: '19 Sep 2026 09:18',
    material: 'Galvanis',
    ukuran: '0.8 x 914',
    lebarMaterial: 914,
    ketebalan: 0.8,
    beratPiece: 18.62,
    beratTabel: 18.2,
    toleransi: 5,
    warna: 'Putih',
  },
  {
    id: 5,
    tanggal: '19 Sep 2026 09:47',
    material: 'Hollow',
    ukuran: '20 x 40',
    lebarMaterial: 40,
    ketebalan: 1.2,
    beratPiece: 7.64,
    beratTabel: 8.1,
    toleransi: 5,
    warna: 'Hijau',
  },
  {
    id: 6,
    tanggal: '19 Sep 2026 10:05',
    material: 'Pipa',
    ukuran: '2"',
    lebarMaterial: 60.3,
    ketebalan: 2,
    beratPiece: 18.84,
    beratTabel: 18.4,
    toleransi: 5,
    warna: 'Putih',
  },
  {
    id: 7,
    tanggal: '19 Sep 2026 10:42',
    material: 'Hollow',
    ukuran: '30 x 60',
    lebarMaterial: 60,
    ketebalan: 1.6,
    beratPiece: 13.92,
    beratTabel: 13.5,
    toleransi: 5,
    warna: 'Putih',
  },
  {
    id: 8,
    tanggal: '19 Sep 2026 11:16',
    material: 'Galvanis',
    ukuran: '1.0 x 1219',
    lebarMaterial: 1219,
    ketebalan: 1,
    beratPiece: 26.48,
    beratTabel: 25.2,
    toleransi: 5,
    warna: 'Merah',
  },
  {
    id: 9,
    tanggal: '19 Sep 2026 11:45',
    material: 'Pipa',
    ukuran: '3"',
    lebarMaterial: 88.9,
    ketebalan: 2.3,
    beratPiece: 24.62,
    beratTabel: 24.8,
    toleransi: 5,
    warna: 'Putih',
  },
  {
    id: 10,
    tanggal: '19 Sep 2026 13:08',
    material: 'Hollow',
    ukuran: '40 x 80',
    lebarMaterial: 80,
    ketebalan: 2,
    beratPiece: 18.34,
    beratTabel: 18.1,
    toleransi: 5,
    warna: 'Putih',
  },
  {
    id: 11,
    tanggal: '19 Sep 2026 13:36',
    material: 'Pipa',
    ukuran: '4"',
    lebarMaterial: 114.3,
    ketebalan: 2.6,
    beratPiece: 31.72,
    beratTabel: 31.4,
    toleransi: 5,
    warna: 'Putih',
  },
  {
    id: 12,
    tanggal: '19 Sep 2026 14:02',
    material: 'Galvanis',
    ukuran: '0.7 x 1000',
    lebarMaterial: 1000,
    ketebalan: 0.7,
    beratPiece: 20.18,
    beratTabel: 21.5,
    toleransi: 5,
    warna: 'Hijau',
  },
];

export default function DashboardPage() {
  /*
   * ==========================================================
   * DUMMY DASHBOARD DATA
   * Nanti bagian ini tinggal diganti dengan data dari API/DB.
   * ==========================================================
   */

  const totalPenimbangan = 1284;

  const totalBeratProduksi = 18426.72;

  const sesuaiToleransi = 1154;

  const perluPemeriksaan = 130;

  const totalPipa = 428;

  const totalHollow = 596;

  const totalGalvanis = 260;

  const beratPipa = 6842.35;

  const beratHollow = 8124.48;

  const beratGalvanis = 3459.89;

  const hijau = 312;

  const putih = 842;

  const merah = 130;

  const totalStatus = hijau + putih + merah;

  const hijauPercentage = ((hijau / totalStatus) * 100).toFixed(1);

  const putihPercentage = ((putih / totalStatus) * 100).toFixed(1);

  const merahPercentage = ((merah / totalStatus) * 100).toFixed(1);

  const qualityRate = (((hijau + putih) / totalStatus) * 100).toFixed(1);

  const productionTrend = [
    {
      hari: 'Min',
      value: 128,
    },
    {
      hari: 'Sen',
      value: 164,
    },
    {
      hari: 'Sel',
      value: 151,
    },
    {
      hari: 'Rab',
      value: 193,
    },
    {
      hari: 'Kam',
      value: 178,
    },
    {
      hari: 'Jum',
      value: 214,
    },
    {
      hari: 'Sab',
      value: 186,
    },
  ];

  const maxProduction = Math.max(...productionTrend.map((item) => item.value));

  return (
    <div className="min-h-screen bg-slate-900">
      {/* =====================================================
          NAVBAR
          ===================================================== */}

      <header className="fixed top-0 left-[220px] right-0 h-16 z-50 bg-slate-800 border-b border-slate-700 shadow-lg">
        <div className="h-full px-6 flex items-center justify-between gap-6">
          <div className="flex items-center shrink-0">
            <h1 className="text-lg font-semibold text-white">Production Dashboard</h1>
          </div>

          <div className="w-full max-w-md">
            <Input
              type="text"
              placeholder="Cari ukuran, material, atau data..."
              icon={<Search size={18} />}
              className="py-2.5"
            />
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
          ===================================================== */}

      <main className="pt-16">
        <div className="p-6">
          {/* =================================================
              PAGE HEADER
              ================================================= */}

          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Factory size={21} className="text-blue-400" />
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-white">Production Overview</h2>

                <p className="text-sm text-slate-400 mt-1">
                  Monitoring penimbangan pipa, hollow, dan bahan galvanis
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              MAIN KPI
              ================================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* TOTAL PENIMBANGAN */}

            <div className="border border-slate-700 bg-slate-800/50 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Penimbangan</p>

                  <p className="text-2xl font-semibold text-white mt-2">
                    {totalPenimbangan.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Scale size={20} className="text-blue-400" />
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-3">Seluruh data penimbangan</p>
            </div>

            {/* BERAT PRODUKSI */}

            <div className="border border-slate-700 bg-slate-800/50 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Berat Produksi</p>

                  <div className="flex items-end gap-2 mt-2">
                    <p className="text-2xl font-semibold text-white">
                      {totalBeratProduksi.toLocaleString('id-ID', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>

                    <span className="text-xs text-slate-500 mb-1">kg</span>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Weight size={20} className="text-emerald-400" />
                </div>
              </div>

              <p className="text-xs text-emerald-400 mt-3">Produksi kumulatif</p>
            </div>

            {/* SESUAI TOLERANSI */}

            <div className="border border-slate-700 bg-slate-800/50 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Sesuai Toleransi</p>

                  <p className="text-2xl font-semibold text-white mt-2">
                    {sesuaiToleransi.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-emerald-400" />
                </div>
              </div>

              <p className="text-xs text-emerald-400 mt-3">{qualityRate}% dari seluruh data</p>
            </div>

            {/* PEMERIKSAAN */}

            <div className="border border-slate-700 bg-slate-800/50 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Perlu Pemeriksaan</p>

                  <p className="text-2xl font-semibold text-white mt-2">
                    {perluPemeriksaan.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-400" />
                </div>
              </div>

              <p className="text-xs text-red-400 mt-3">Di luar batas toleransi</p>
            </div>
          </div>

          {/* =================================================
              MATERIAL SUMMARY
              ================================================= */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
            {/* PIPA */}

            <div className="border border-slate-700 bg-slate-800/50 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Package size={20} className="text-blue-400" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Pipa</p>

                    <p className="text-lg font-semibold text-white">{totalPipa} data</p>
                  </div>
                </div>

                <span className="text-sm text-slate-500">
                  {beratPipa.toLocaleString('id-ID')} kg
                </span>
              </div>

              <div className="h-1.5 bg-slate-700 rounded-full mt-5 overflow-hidden">
                <div
                  className="h-full bg-blue-400 rounded-full"
                  style={{
                    width: `${(totalPipa / totalPenimbangan) * 100}%`,
                  }}
                />
              </div>

              <p className="text-xs text-slate-500 mt-2">
                {((totalPipa / totalPenimbangan) * 100).toFixed(1)}% dari seluruh penimbangan
              </p>
            </div>

            {/* HOLLOW */}

            <div className="border border-slate-700 bg-slate-800/50 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Boxes size={20} className="text-amber-400" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Hollow</p>

                    <p className="text-lg font-semibold text-white">{totalHollow} data</p>
                  </div>
                </div>

                <span className="text-sm text-slate-500">
                  {beratHollow.toLocaleString('id-ID')} kg
                </span>
              </div>

              <div className="h-1.5 bg-slate-700 rounded-full mt-5 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{
                    width: `${(totalHollow / totalPenimbangan) * 100}%`,
                  }}
                />
              </div>

              <p className="text-xs text-slate-500 mt-2">
                {((totalHollow / totalPenimbangan) * 100).toFixed(1)}% dari seluruh penimbangan
              </p>
            </div>

            {/* GALVANIS */}

            <div className="border border-slate-700 bg-slate-800/50 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <Package size={20} className="text-cyan-400" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Galvanis</p>

                    <p className="text-lg font-semibold text-white">{totalGalvanis} data</p>
                  </div>
                </div>

                <span className="text-sm text-slate-500">
                  {beratGalvanis.toLocaleString('id-ID')} kg
                </span>
              </div>

              <div className="h-1.5 bg-slate-700 rounded-full mt-5 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{
                    width: `${(totalGalvanis / totalPenimbangan) * 100}%`,
                  }}
                />
              </div>

              <p className="text-xs text-slate-500 mt-2">
                {((totalGalvanis / totalPenimbangan) * 100).toFixed(1)}% dari seluruh penimbangan
              </p>
            </div>
          </div>

          {/* =================================================
              RECENT DATA + QUALITY
              ================================================= */}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
            {/* RECENT PRODUCTION */}

            <div className="xl:col-span-2 border border-slate-700 bg-slate-800/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-semibold text-white">Recent Production</h3>

                  <p className="text-sm text-slate-400 mt-1">
                    Data produksi dan hasil penimbangan terbaru
                  </p>
                </div>

                <span className="text-xs text-slate-500">12 data</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-left">
                      <th className="py-3 px-2 text-slate-400 font-medium">Waktu</th>

                      <th className="py-3 px-2 text-slate-400 font-medium">Material</th>

                      <th className="py-3 px-2 text-slate-400 font-medium">Ukuran</th>

                      <th className="py-3 px-2 text-slate-400 font-medium">Tebal</th>

                      <th className="py-3 px-2 text-slate-400 font-medium">Berat</th>

                      <th className="py-3 px-2 text-slate-400 font-medium">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {dummyData.slice(0, 8).map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-slate-800 hover:bg-slate-800/70 transition"
                      >
                        <td className="py-3 px-2 text-slate-400 whitespace-nowrap">
                          {item.tanggal}
                        </td>

                        <td className="py-3 px-2">
                          <span className="text-white font-medium">{item.material}</span>
                        </td>

                        <td className="py-3 px-2 text-slate-300">{item.ukuran}</td>

                        <td className="py-3 px-2 text-slate-300">{item.ketebalan.toFixed(1)} mm</td>

                        <td className="py-3 px-2 text-white">{item.beratPiece.toFixed(2)} kg</td>

                        <td className="py-3 px-2">
                          <span
                            className={`
                              inline-flex
                              px-2.5
                              py-1
                              rounded-full
                              text-xs
                              font-medium
                              ${
                                item.warna === 'Hijau'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : item.warna === 'Merah'
                                    ? 'bg-red-500/10 text-red-400'
                                    : 'bg-slate-500/10 text-slate-300'
                              }
                            `}
                          >
                            {item.warna}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* QUALITY CONTROL */}

            <div className="border border-slate-700 bg-slate-800/50 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Quality Control</h3>

                  <p className="text-sm text-slate-400 mt-1">Hasil pemeriksaan berat</p>
                </div>

                <CheckCircle2 size={20} className="text-emerald-400" />
              </div>

              {/* PUTIH */}

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />

                    <span className="text-sm text-slate-300">Sesuai</span>
                  </div>

                  <span className="text-sm font-medium text-white">{putih}</span>
                </div>

                <div className="h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-slate-300 rounded-full"
                    style={{
                      width: `${putihPercentage}%`,
                    }}
                  />
                </div>

                <p className="text-xs text-slate-500 mt-1">{putihPercentage}%</p>
              </div>

              {/* HIJAU */}

              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />

                    <span className="text-sm text-slate-300">Di bawah toleransi</span>
                  </div>

                  <span className="text-sm font-medium text-white">{hijau}</span>
                </div>

                <div className="h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{
                      width: `${hijauPercentage}%`,
                    }}
                  />
                </div>

                <p className="text-xs text-slate-500 mt-1">{hijauPercentage}%</p>
              </div>

              {/* MERAH */}

              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />

                    <span className="text-sm text-slate-300">Di atas toleransi</span>
                  </div>

                  <span className="text-sm font-medium text-white">{merah}</span>
                </div>

                <div className="h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-red-400 rounded-full"
                    style={{
                      width: `${merahPercentage}%`,
                    }}
                  />
                </div>

                <p className="text-xs text-slate-500 mt-1">{merahPercentage}%</p>
              </div>

              {/* QUALITY RATE */}

              <div className="border-t border-slate-700 mt-6 pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Quality Rate</span>

                  <span className="text-lg font-semibold text-emerald-400">{qualityRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              PRODUCTION TREND
              ================================================= */}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
            {/* TREND */}

            <div className="xl:col-span-2 border border-slate-700 bg-slate-800/50 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Production Trend</h3>

                  <p className="text-sm text-slate-400 mt-1">Jumlah penimbangan 7 hari terakhir</p>
                </div>

                <TrendingUp size={20} className="text-emerald-400" />
              </div>

              <div className="flex items-end gap-4 h-48 mt-6">
                {productionTrend.map((item) => {
                  const height = (item.value / maxProduction) * 100;

                  return (
                    <div key={item.hari} className="flex-1 h-full flex flex-col justify-end">
                      <div className="flex justify-center mb-2">
                        <span className="text-xs text-slate-400">{item.value}</span>
                      </div>

                      <div
                        className="w-full bg-blue-500/70 hover:bg-blue-400 rounded-t-md transition"
                        style={{
                          height: `${height}%`,
                        }}
                      />

                      <span className="text-xs text-slate-500 text-center mt-2">{item.hari}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MATERIAL DISTRIBUTION */}

            <div className="border border-slate-700 bg-slate-800/50 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Material Distribution</h3>

                  <p className="text-sm text-slate-400 mt-1">Komposisi produksi</p>
                </div>

                <Package size={20} className="text-slate-400" />
              </div>

              {/* PIPA */}

              <div className="mt-6">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-300">Pipa</span>

                  <span className="text-sm text-white">{totalPipa}</span>
                </div>

                <div className="h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full"
                    style={{
                      width: `${(totalPipa / totalPenimbangan) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* HOLLOW */}

              <div className="mt-5">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-300">Hollow</span>

                  <span className="text-sm text-white">{totalHollow}</span>
                </div>

                <div className="h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{
                      width: `${(totalHollow / totalPenimbangan) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* GALVANIS */}

              <div className="mt-5">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-300">Galvanis</span>

                  <span className="text-sm text-white">{totalGalvanis}</span>
                </div>

                <div className="h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{
                      width: `${(totalGalvanis / totalPenimbangan) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* TOTAL */}

              <div className="border-t border-slate-700 mt-6 pt-5">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Total</span>

                  <span className="text-sm font-semibold text-white">
                    {totalPenimbangan.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
