'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, Scale, Settings } from 'lucide-react';

export default function Sidebar() {
  const currentPath = usePathname();
  const router = useRouter();

  const menuList = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Data Masuk', path: '/data-masuk', icon: FileText },
    {
      name: 'Data Penimbangan',
      path: '/data-penimbangan',
      icon: Scale,
    },
    { name: 'Pengaturan', path: '/pengaturan', icon: Settings },
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
        {menuList.map((menu) => {
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
