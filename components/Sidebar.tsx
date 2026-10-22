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
  Menu,
  X,
  Info,
  Ruler,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import Button from '@/components/Button';
import { useSidebar } from '@/app/layout';

interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

export default function Sidebar() {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const currentPath = usePathname();
  const router = useRouter();

  const isDataPage = currentPath.startsWith('/data-penimbangan');
  const [isDataOpen, setIsDataOpen] = useState(isDataPage);

  const mainMenus: MenuItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Data Masuk', path: '/data-masuk', icon: FileText },
    { name: 'Coil Length Calculator', path: '/coilLength', icon: Ruler },
  ];

  const bottomMenus: MenuItem[] = [
    { name: 'Pengaturan', path: '/pengaturan', icon: Settings },
    { name: 'Tentang', path: '/tentang', icon: Info },
  ];

  const dataSubmenu: MenuItem[] = [
    { name: 'Rekap Harian', path: '/data-penimbangan', icon: CalendarDays },
    { name: 'Seluruh Data', path: '/data-penimbangan/seluruh-data', icon: List },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.replace('/login');
      router.refresh();
    } catch (error) {
      console.error('LOGOUT ERROR:', error);
    }
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white py-5 transition-[width] duration-200 ease-in-out md:flex ${
        isSidebarOpen ? 'w-55 px-3' : 'w-17.5 px-2'
      }`}
    >
      <div
        className={`mb-8 flex items-center ${
          isSidebarOpen ? 'justify-between px-2' : 'justify-center px-0'
        }`}
      >
        {isSidebarOpen && (
          <h1 className="text-sm font-bold leading-5 tracking-wide text-blue-600 truncate">
            Production Control
          </h1>
        )}

        <Button
          type="button"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
          title={isSidebarOpen ? 'Tutup Sidebar' : 'Buka Sidebar'}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden">
        {mainMenus.map((menu) => {
          const isActive = currentPath === menu.path;
          const IconComponent = menu.icon;

          return (
            <Link
              key={menu.path}
              href={menu.path}
              title={!isSidebarOpen ? menu.name : undefined}
              className={`flex items-center rounded-lg py-2.5 text-[13px] font-medium transition-colors ${
                isSidebarOpen ? 'px-3 gap-3 justify-start' : 'px-0 justify-center'
              } ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <IconComponent size={18} strokeWidth={1.8} className="shrink-0" />
              {isSidebarOpen && <span className="truncate">{menu.name}</span>}
            </Link>
          );
        })}

        <div>
          <button
            type="button"
            onClick={() => {
              if (!isSidebarOpen) setIsSidebarOpen(true);
              setIsDataOpen((prev) => !prev);
            }}
            title={!isSidebarOpen ? 'Data Penimbangan' : undefined}
            className={`flex w-full items-center rounded-lg py-2.5 text-[13px] font-medium transition-colors ${
              isSidebarOpen ? 'px-3 justify-between' : 'px-0 justify-center'
            } ${isDataPage ? 'text-blue-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            <span
              className={`flex items-center ${isSidebarOpen ? 'gap-3' : 'justify-center w-full'}`}
            >
              <Scale size={18} strokeWidth={1.8} className="shrink-0" />
              {isSidebarOpen && <span className="truncate">Data Penimbangan</span>}
            </span>

            {isSidebarOpen && (
              <ChevronDown
                size={15}
                strokeWidth={1.8}
                className={`transition-transform duration-200 ${isDataOpen ? 'rotate-180' : ''}`}
              />
            )}
          </button>

          {isSidebarOpen && isDataOpen && (
            <div className="ml-5 mt-1 space-y-1 border-l border-gray-200 pl-3">
              {dataSubmenu.map((sub) => {
                const isSubActive = currentPath === sub.path;
                const SubIcon = sub.icon;

                return (
                  <Link
                    key={sub.path}
                    href={sub.path}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium transition-colors ${
                      isSubActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <SubIcon size={16} strokeWidth={1.8} className="shrink-0" />
                    <span className="truncate">{sub.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {bottomMenus.map((menu) => {
          const isActive = currentPath === menu.path;
          const IconComponent = menu.icon;

          return (
            <Link
              key={menu.path}
              href={menu.path}
              title={!isSidebarOpen ? menu.name : undefined}
              className={`flex items-center rounded-lg py-2.5 text-[13px] font-medium transition-colors ${
                isSidebarOpen ? 'px-3 gap-3 justify-start' : 'px-0 justify-center'
              } ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <IconComponent size={18} strokeWidth={1.8} className="shrink-0" />
              {isSidebarOpen && <span className="truncate">{menu.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 pt-4 px-1">
        <Button
          type="button"
          onClick={handleLogout}
          title={!isSidebarOpen ? 'Keluar' : undefined}
          className={`w-full flex items-center cursor-pointer rounded-lg border border-red-200 bg-red-50 py-2.5 text-[13px] font-medium text-red-600 transition-colors duration-200 hover:bg-red-100 hover:text-red-700 ${
            isSidebarOpen ? 'px-3 gap-3 justify-start' : 'justify-center px-0'
          }`}
        >
          <LogOut size={18} strokeWidth={1.8} className="shrink-0" />
          {isSidebarOpen && <span className="truncate">Keluar</span>}
        </Button>
      </div>
    </aside>
  );
}
