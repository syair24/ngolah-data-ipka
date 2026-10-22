'use client';

import { useState } from 'react';
import { Calculator, RotateCcw, Ruler, Weight, CheckCircle2, Layers } from 'lucide-react';

import Input from '@/components/Input';
import Button from '@/components/Button';
import Navbar from '@/components/Navbar';
import { useSidebar } from '@/app/layout';

export default function CoilLengthPage() {
  const { isSidebarOpen } = useSidebar();

  const [berat, setBerat] = useState('');
  const [tebal, setTebal] = useState('');
  const [lebar, setLebar] = useState('');
  const [panjangPerBatang, setPanjangPerBatang] = useState('6');

  const [hasil, setHasil] = useState<number | null>(null);
  const [error, setError] = useState('');

  const hitungPanjang = () => {
    setError('');

    const beratValue = Number(berat);
    const tebalValue = Number(tebal);
    const lebarValue = Number(lebar);
    const panjangBatangValue = Number(panjangPerBatang);

    if (
      !berat.trim() ||
      !tebal.trim() ||
      !lebar.trim() ||
      !panjangPerBatang.trim() ||
      !Number.isFinite(beratValue) ||
      !Number.isFinite(tebalValue) ||
      !Number.isFinite(lebarValue) ||
      !Number.isFinite(panjangBatangValue) ||
      beratValue <= 0 ||
      tebalValue <= 0 ||
      lebarValue <= 0 ||
      panjangBatangValue <= 0
    ) {
      setHasil(null);
      setError('Masukkan semua nilai dengan benar dan lebih dari 0.');
      return;
    }

    // Faktor densitas efektif material
    const densitasEfektif = 7.67512;

    // Estimasi panjang total coil dalam meter
    const panjang = (beratValue * 1000) / (tebalValue * lebarValue * densitasEfektif);

    setHasil(panjang);
  };

  const resetForm = () => {
    setBerat('');
    setTebal('');
    setLebar('');
    setPanjangPerBatang('6');
    setHasil(null);
    setError('');
  };

  const formatAngka = (angka: number) =>
    angka.toLocaleString('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Hasil pembagian panjang coil
  const jumlahBatang =
    hasil !== null ? Math.floor((hasil + Number.EPSILON) / Number(panjangPerBatang)) : 0;

  const sisaPanjang =
    hasil !== null ? Math.max(0, hasil - jumlahBatang * Number(panjangPerBatang)) : 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* NAVBAR TERPISAH DI LUAR KONTEN */}
      <Navbar title="Coil Length Calculator" />

      {/* KONTEN UTAMA DENGAN TRANSISI PADDING KIRI MENGIKUTI SIDEBAR */}
      <main
        className={`transition-[padding] duration-200 ease-in-out ${
          isSidebarOpen ? 'md:pl-5' : 'md:pl-5'
        }`}
      >
        <div className="mx-auto pr-5 pt-20 ">
          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
            {/* KOLOM KIRI: INPUT */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Calculator size={20} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-gray-900">Input Data Coil</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Masukkan spesifikasi coil yang ingin dihitung.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-6">
                {/* BERAT */}
                <div className="space-y-2">
                  <label htmlFor="berat" className="block text-sm font-medium text-gray-700">
                    Berat Coil
                    <span className="ml-1 text-gray-400">(kg)</span>
                  </label>

                  <div className="relative">
                    <Input
                      id="berat"
                      type="number"
                      min="0"
                      step="any"
                      inputMode="decimal"
                      placeholder="Contoh: 7130"
                      value={berat}
                      onChange={(e) => setBerat(e.target.value)}
                      className="border-gray-300! bg-white! text-gray-900! placeholder:text-gray-400! outline-none! focus:border-blue-500! focus:ring-2! focus:ring-blue-500/30! focus:ring-offset-1!"
                    />

                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-gray-500">
                      kg
                    </span>
                  </div>
                </div>

                {/* TEBAL */}
                <div className="space-y-2">
                  <label htmlFor="tebal" className="block text-sm font-medium text-gray-700">
                    Tebal Bahan
                    <span className="ml-1 text-gray-400">(mm)</span>
                  </label>

                  <div className="relative">
                    <Input
                      id="tebal"
                      type="number"
                      min="0"
                      step="any"
                      inputMode="decimal"
                      placeholder="Contoh: 0.88"
                      value={tebal}
                      onChange={(e) => setTebal(e.target.value)}
                      className="border-gray-300! bg-white! text-gray-900! placeholder:text-gray-400! outline-none! focus:border-blue-500! focus:ring-2! focus:ring-blue-500/30! focus:ring-offset-1!"
                    />

                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-gray-500">
                      mm
                    </span>
                  </div>
                </div>

                {/* LEBAR */}
                <div className="space-y-2">
                  <label htmlFor="lebar" className="block text-sm font-medium text-gray-700">
                    Lebar Bahan
                    <span className="ml-1 text-gray-400">(mm)</span>
                  </label>

                  <div className="relative">
                    <Input
                      id="lebar"
                      type="number"
                      min="0"
                      step="any"
                      inputMode="decimal"
                      placeholder="Contoh: 1219"
                      value={lebar}
                      onChange={(e) => setLebar(e.target.value)}
                      className="border-gray-300! bg-white! text-gray-900! placeholder:text-gray-400! outline-none! focus:border-blue-500! focus:ring-2! focus:ring-blue-500/30! focus:ring-offset-1!"
                    />

                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-gray-500">
                      mm
                    </span>
                  </div>
                </div>

                {/* PEMBAGIAN PANJANG */}
                <div className="border-t border-gray-200 pt-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                      <Layers size={19} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Pembagian Panjang</h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Tentukan panjang untuk setiap batang.
                      </p>
                    </div>
                  </div>

                  <label
                    htmlFor="panjangPerBatang"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Panjang per Batang
                  </label>

                  <div className="relative">
                    <Input
                      id="panjangPerBatang"
                      type="number"
                      min="0"
                      step="any"
                      inputMode="decimal"
                      placeholder="Contoh: 6"
                      value={panjangPerBatang}
                      onChange={(e) => setPanjangPerBatang(e.target.value)}
                      className="border-gray-300! bg-white! text-gray-900! placeholder:text-gray-400! outline-none! focus:border-violet-500! focus:ring-2! focus:ring-violet-500/30! focus:ring-offset-1!"
                    />

                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-gray-500">
                      meter
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Contoh: isi 6 untuk membagi coil menjadi batang dengan panjang masing-masing 6
                    meter.
                  </p>
                </div>

                {/* ERROR */}
                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {error}
                  </div>
                )}

                {/* BUTTONS */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    onClick={hitungPanjang}
                    className="h-11 flex-1 gap-2 rounded-lg bg-blue-600 px-5 text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    <Calculator size={17} />
                    Hitung Panjang
                  </Button>

                  <Button
                    onClick={resetForm}
                    className="h-11 gap-2 rounded-lg border border-gray-300 bg-white px-5 text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    <RotateCcw size={16} />
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            {/* KOLOM KANAN: HASIL */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Ruler size={20} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-gray-900">Hasil Perhitungan</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Estimasi panjang dan pembagian coil.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-6">
                {/* TOTAL PANJANG */}
                <div className="flex min-h-55 flex-col items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-5 py-8 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                    <Ruler size={27} />
                  </div>

                  <p className="text-sm font-medium text-gray-600">Total Panjang Coil</p>

                  {hasil !== null ? (
                    <>
                      <div className="mt-3 flex flex-wrap items-baseline justify-center gap-2">
                        <span className="break-all text-4xl font-bold tracking-tight text-blue-700 sm:text-5xl">
                          {formatAngka(hasil)}
                        </span>
                        <span className="text-lg font-medium text-gray-600">meter</span>
                      </div>

                      <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">
                        <CheckCircle2 size={16} />
                        Perhitungan berhasil
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mt-3 text-4xl font-bold text-gray-400 sm:text-5xl">— —</div>
                      <p className="mt-3 max-w-xs text-sm leading-6 text-gray-600">
                        Masukkan data coil, lalu tekan Hitung Panjang untuk melihat hasilnya.
                      </p>
                    </>
                  )}
                </div>

                {/* HASIL PEMBAGIAN */}
                <div className="rounded-xl border border-violet-200 bg-violet-50/70 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                      <Layers size={20} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">Hasil Pembagian Batang</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Panjang per batang: {panjangPerBatang || '—'} meter
                      </p>
                    </div>
                  </div>

                  {hasil !== null && Number(panjangPerBatang) > 0 && panjangPerBatang.trim() ? (
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-violet-100 bg-white p-4">
                        <p className="text-sm text-gray-600">Jumlah Batang Utuh</p>
                        <p className="mt-2 text-3xl font-bold text-violet-700">
                          {jumlahBatang.toLocaleString('id-ID')}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">batang</p>
                      </div>

                      <div className="rounded-xl border border-violet-100 bg-white p-4">
                        <p className="text-sm text-gray-600">Sisa Panjang</p>
                        <p className="mt-2 text-3xl font-bold text-violet-700">
                          {formatAngka(sisaPanjang)}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">meter</p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-5 rounded-lg border border-violet-100 bg-white p-4 text-sm leading-6 text-gray-600">
                      Hasil jumlah batang dan sisa meter akan muncul setelah perhitungan panjang
                      coil berhasil.
                    </p>
                  )}

                  {hasil !== null && Number(panjangPerBatang) > 0 && panjangPerBatang.trim() && (
                    <p className="mt-4 text-xs leading-5 text-gray-600">
                      Perhitungan menggunakan panjang total coil dibagi panjang per batang. Sisa
                      meter adalah panjang yang tidak cukup untuk membentuk satu batang utuh.
                    </p>
                  )}
                </div>

                {/* RINGKASAN INPUT */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-800">Ringkasan Data</h3>

                  <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 px-4">
                    <div className="flex items-center justify-between gap-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Weight size={16} />
                        Berat Coil
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {berat ? `${berat} kg` : '—'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Ruler size={16} />
                        Tebal Bahan
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {tebal ? `${tebal} mm` : '—'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Ruler size={16} />
                        Lebar Bahan
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {lebar ? `${lebar} mm` : '—'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Layers size={16} />
                        Panjang per Batang
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {panjangPerBatang ? `${panjangPerBatang} meter` : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CATATAN */}
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-900">Catatan Perhitungan</p>
                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    Panjang coil menggunakan faktor densitas efektif 7,67512. Jumlah batang
                    dibulatkan ke bawah agar hanya menghitung batang utuh. Sisa meter ditampilkan
                    terpisah. Hasil merupakan estimasi dan dapat berbeda dari panjang aktual.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
