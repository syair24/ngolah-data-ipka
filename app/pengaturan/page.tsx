'use client';

import { useSidebar } from '@/app/layout';

export default function PengaturanPage() {
  const { isSidebarOpen } = useSidebar();

  return (
    <div
      className={`fixed inset-x-0 bottom-0 top-16 flex items-center justify-center bg-gray-50 px-4 transition-[left] duration-200 ease-in-out ${
        isSidebarOpen ? 'left-0 md:left-55' : 'left-0 md:left-17.5'
      }`}
    >
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
          <span className="text-4xl">⚙️</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-800">Coming Soon</h1>

        <p className="mt-3 text-sm text-gray-500">Halaman pengaturan sedang dalam pengembangan.</p>

        <span className="mt-6 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-700">
          Under Development
        </span>
      </div>
    </div>
  );
}
