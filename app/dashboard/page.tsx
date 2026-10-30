'use client';

import Navbar from '@/components/Navbar';
import WeightToleranceChart from '@/components/WeightToleranceChart';
import NotificationBell from '@/components/NotificationBell';

import {
  formatDate,
  getStatus,
  useDashboardData,
  useDashboardUsername,
} from '@/lib/dashboard-helpers';

export default function DashboardPage() {
  const { weighingGroups, loading, error, tanggalTerbaru, latestDateData } = useDashboardData();
  const username = useDashboardUsername();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar title="Production Dashboard">
          <div className="flex h-9 items-center rounded-md border border-emerald-200 bg-emerald-50 px-3.5">
            <span className="text-sm font-medium text-emerald-700">Memuat akun...</span>
          </div>
        </Navbar>

        <main className="px-3 pt-20">
          <div className="flex min-h-64 flex-col items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            <p className="mt-4 text-sm text-gray-500">Memuat data dari database...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Production Dashboard">
        <div className="flex items-center gap-2">
          <NotificationBell />

          <div className="flex h-9 items-center rounded-md border border-emerald-200 bg-emerald-50 px-3.5">
            <span className="text-sm font-medium text-emerald-700">{username || 'err'}</span>
          </div>
        </div>
      </Navbar>

      <main className="px-2 pt-20">
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        <WeightToleranceChart data={weighingGroups} />

        <section className="mt-6 flex h-130 flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex shrink-0 items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Latest Production Data</h2>

              <p className="mt-1 text-sm text-gray-500">
                {tanggalTerbaru
                  ? `Data penimbangan terakhir — ${formatDate(tanggalTerbaru)}`
                  : 'Belum ada data penimbangan'}
              </p>
            </div>

            <span className="shrink-0 rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs text-gray-700">
              {latestDateData.length} data
            </span>
          </div>

          <div className="dashboard-scrollbar min-h-0 flex-1 overflow-auto rounded-lg border border-gray-200">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 z-20 bg-gray-100">
                <tr className="border-b border-gray-200 text-center text-xs font-medium uppercase text-gray-600">
                  <th className="whitespace-nowrap px-3 py-3">No</th>
                  <th className="whitespace-nowrap px-3 py-3">Lebar Material</th>
                  <th className="whitespace-nowrap px-3 py-3">Ukuran</th>
                  <th className="whitespace-nowrap px-3 py-3">Ketebalan</th>
                  <th className="whitespace-nowrap px-3 py-3">Berat Kg/Btg</th>
                  <th className="whitespace-nowrap px-3 py-3">Berat Tabel</th>
                  <th className="whitespace-nowrap px-3 py-3">Toleransi</th>
                </tr>
              </thead>

              <tbody>
                {latestDateData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-500">
                      Belum ada data penimbangan.
                    </td>
                  </tr>
                ) : (
                  latestDateData.map((item, index) => {
                    const status = getStatus(item);

                    const rowClass =
                      status === 'Di bawah toleransi'
                        ? 'bg-emerald-50 hover:bg-emerald-100/60'
                        : status === 'Di atas toleransi'
                          ? 'bg-red-50 hover:bg-red-100/60'
                          : 'bg-white hover:bg-gray-50';

                    return (
                      <tr
                        key={item.id}
                        className={`${rowClass} border-b border-gray-200 transition-colors`}
                      >
                        <td className="whitespace-nowrap px-3 py-3 text-center text-gray-500">
                          {index + 1}
                        </td>

                        <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                          {item.lebarMaterial}
                        </td>

                        <td className="whitespace-nowrap px-3 py-3 text-center font-medium text-gray-900">
                          {item.ukuran}
                        </td>

                        <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                          {item.ketebalan.toFixed(1)} mm
                        </td>

                        <td className="whitespace-nowrap px-3 py-3 text-center font-medium text-gray-900">
                          {item.beratPiece.toFixed(2)} kg
                        </td>

                        <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                          {item.beratTabel.toFixed(2)} kg
                        </td>

                        <td className="whitespace-nowrap px-3 py-3 text-center text-gray-700">
                          ±{item.toleransi}%
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
