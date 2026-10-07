export default function TentangPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
            Tentang Sistem
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Production Control System
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
            Sistem pengolahan dan pengendalian data produksi untuk membantu proses penimbangan,
            perhitungan material, serta pengawasan toleransi berat produk hollow dan pipa galvanis.
          </p>
        </div>

        <div className="space-y-6">
          {/* TENTANG SISTEM */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Tentang Sistem</h2>

            <p className="text-sm leading-7 text-gray-600">
              Website ini dibuat sebagai sistem untuk membantu pengolahan data hasil penimbangan
              produk hollow dan pipa galvanis per batang. Sistem digunakan untuk mencatat, mengolah,
              dan memantau berat produk berdasarkan berat tabel serta batas toleransi yang telah
              ditentukan.
            </p>

            <p className="mt-3 text-sm leading-7 text-gray-600">
              Setiap hasil penimbangan dapat dibandingkan dengan berat standar untuk mengetahui
              apakah berat produk masih berada dalam batas toleransi yang diperbolehkan. Dengan
              demikian, produk yang memiliki berat di luar batas toleransi dapat lebih mudah
              diketahui dan dikendalikan.
            </p>
          </section>

          {/* TOLERANSI */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Pengendalian Toleransi Berat
            </h2>

            <p className="text-sm leading-7 text-gray-600">
              Sistem menghitung batas bawah dan batas atas berat berdasarkan nilai berat standar dan
              persentase toleransi yang telah ditentukan. Hasil penimbangan kemudian dibandingkan
              dengan batas tersebut untuk menentukan apakah berat produk masih memenuhi standar.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500">Di bawah batas</p>
                <p className="mt-1 text-sm font-semibold text-green-600">Perlu diperiksa</p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500">Dalam toleransi</p>
                <p className="mt-1 text-sm font-semibold text-gray-700">Memenuhi batas</p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500">Melebihi batas</p>
                <p className="mt-1 text-sm font-semibold text-red-600">Di luar toleransi</p>
              </div>
            </div>
          </section>

          {/* PERHITUNGAN COIL */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Perhitungan Coil dan Batang
            </h2>

            <p className="text-sm leading-7 text-gray-600">
              Selain pengolahan data penimbangan, sistem ini juga dapat digunakan untuk membantu
              menghitung kebutuhan material dari coil galvanis. Perhitungan dapat digunakan untuk
              mengetahui panjang material dalam satu coil serta memperkirakan berapa banyak batang
              hollow atau pipa galvanis yang dapat dihasilkan dari satu coil.
            </p>

            <p className="mt-3 text-sm leading-7 text-gray-600">
              Perhitungan tersebut dapat disesuaikan dengan panjang coil dan panjang setiap batang
              produk. Dengan demikian, pengguna dapat memperoleh gambaran mengenai jumlah batang
              yang dapat dihasilkan dari satu coil sebelum proses produksi dilakukan.
            </p>
          </section>

          {/* TUJUAN */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Tujuan Pembuatan</h2>

            <p className="text-sm leading-7 text-gray-600">
              Sistem ini dibuat untuk membantu proses pengolahan data produksi menjadi lebih
              terstruktur, mempermudah pemantauan hasil penimbangan, membantu pengendalian toleransi
              berat, serta memberikan perhitungan material yang dapat digunakan sebagai pendukung
              proses produksi.
            </p>
          </section>

          {/* PEMBUAT */}
          <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Informasi Pengembang
            </p>

            <h2 className="mt-2 text-xl font-bold text-gray-900">Syair Surya Samudra</h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Sistem ini dibuat dan dikembangkan oleh Syair Surya Samudra sebagai sebuah aplikasi
              untuk mendukung pengolahan data dan pengendalian proses produksi hollow serta pipa
              galvanis.
            </p>

            <div className="mt-4 border-t border-blue-100 pt-4">
              <p className="text-xs text-gray-500">Tanggal pembuatan</p>

              <p className="mt-1 text-sm font-medium text-gray-800">26 September 2026</p>
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <div className="py-8 text-center">
          <p className="text-xs text-gray-400">Production Control System © 2026</p>

          <p className="mt-1 text-xs text-gray-400">Dibuat oleh Syair Surya Samudra</p>
        </div>
      </div>
    </main>
  );
}
