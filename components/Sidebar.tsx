'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Scale,
  Settings,
  CalendarDays,
  List,
  ChevronDown,
  Info,
} from 'lucide-react';

export default function Sidebar() {
  const currentPath = usePathname();
  const router = useRouter();

  const isDataPage = currentPath.startsWith('/data-penimbangan');
  const [isDataOpen, setIsDataOpen] = useState(isDataPage);

  const menuList = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Data Masuk',
      path: '/data-masuk',
      icon: FileText,
    },
    {
      name: 'Pengaturan',
      path: '/pengaturan',
      icon: Settings,
    },
    {
      name: 'Tentang',
      path: '/tentang',
      icon: Info,
    },
  ];

  const dataSubmenu = [
    {
      name: 'Rekap Harian',
      path: '/data-penimbangan',
      icon: CalendarDays,
    },
    {
      name: 'Seluruh Data',
      path: '/data-penimbangan/seluruh-data',
      icon: List,
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
      });

      router.replace('/login');
      router.refresh();
    } catch (error) {
      console.error('LOGOUT ERROR:', error);
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[220px] flex-col border-r border-gray-200 bg-white px-3 py-5 md:flex">
      {/* LOGO */}
      <div className="mb-8 px-2">
        <h1 className="text-sm font-bold leading-5 tracking-wide text-blue-600">
          Production Control
          <span className="block text-gray-700">System</span>
        </h1>
      </div>

      {/* MENU */}
      <nav className="flex-1 space-y-1">
        {/* DASHBOARD & DATA MASUK */}
        {menuList.slice(0, 2).map((menu) => {
          const isCurrentActive = currentPath === menu.path;
          const IconComponent = menu.icon;

          return (
            <Link
              key={menu.path}
              href={menu.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                isCurrentActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <IconComponent size={17} strokeWidth={1.8} />

              <span>{menu.name}</span>
            </Link>
          );
        })}

        {/* DATA PENIMBANGAN */}
        <div>
          <button
            type="button"
            onClick={() => setIsDataOpen((prev) => !prev)}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
              isDataPage ? 'text-blue-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span className="flex items-center gap-3">
              <Scale size={17} strokeWidth={1.8} />

              <span>Data Penimbangan</span>
            </span>

            <ChevronDown
              size={15}
              strokeWidth={1.8}
              className={`transition-transform duration-200 ${isDataOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* SUBMENU */}
          {isDataOpen && (
            <div className="ml-5 mt-1 space-y-1 border-l border-gray-200 pl-3">
              {dataSubmenu.map((menu) => {
                const IconComponent = menu.icon;
                const isActive = currentPath === menu.path;

                return (
                  <Link
                    key={menu.path}
                    href={menu.path}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent size={16} strokeWidth={1.8} />

                    <span>{menu.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* PENGATURAN */}
        {menuList.slice(2, 3).map((menu) => {
          const isCurrentActive = currentPath === menu.path;
          const IconComponent = menu.icon;

          return (
            <Link
              key={menu.path}
              href={menu.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                isCurrentActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <IconComponent size={17} strokeWidth={1.8} />

              <span>{menu.name}</span>
            </Link>
          );
        })}

        {/* TENTANG */}
        {menuList.slice(3).map((menu) => {
          const isCurrentActive = currentPath === menu.path;
          const IconComponent = menu.icon;

          return (
            <Link
              key={menu.path}
              href={menu.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                isCurrentActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <IconComponent size={17} strokeWidth={1.8} />

              <span>{menu.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* KELUAR */}
      <div className="border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full cursor-pointer rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-center text-[13px] font-medium text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
}
