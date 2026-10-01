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
    { name: 'Data Penimbangan', path: '/data-penimbangan', icon: Scale },
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
    <aside className="fixed z-50 hidden h-full w-[220px] flex-col border-r border-gray-200 bg-white p-5 md:flex">
      {/* LOGO */}
      <div className="mb-8 px-3 text-xl font-bold tracking-wider text-blue-600">KALTO</div>

      {/* MENU */}
      <nav className="flex-1 space-y-1">
        {menuList.map((menu) => {
          const isCurrentActive = currentPath === menu.path;
          const IconComponent = menu.icon;

          return (
            <Link
              key={menu.path}
              href={menu.path}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isCurrentActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <IconComponent size={18} />
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
          className="w-full cursor-pointer rounded-xl border border-red-200 bg-red-50 py-2.5 text-center text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
}
