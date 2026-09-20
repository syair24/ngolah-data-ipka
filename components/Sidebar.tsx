'use client';

import Link from 'next/link';

import { usePathname, useRouter } from 'next/navigation';

export default function Sidebar() {
  const currentPath = usePathname();
  const router = useRouter();

  const menuList = [
    { name: 'dashboard', path: '/dashboard' },
    { name: 'Data Masuk', path: '/data-masuk' },
    { name: 'Data Penimbangan', path: '/data-penimbangan' },
    { name: 'Pengaturan', path: '/pengaturan' },
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
    <aside className="fixed z-50 hidden h-full w-[220px] flex-col border-r border-slate-700 bg-slate-800 p-5 md:flex">
      {/* LOGO */}
      <div className="mb-8 text-xl font-bold tracking-wider text-blue-400">KALTO</div>

      {/* MENU */}
      <nav className="flex-1 space-y-2">
        {menuList.map((menu) => {
          const isCurrentActive = currentPath === menu.path;

          return (
            <Link
              key={menu.path}
              href={menu.path}
              className={`block w-full rounded-lg px-4 py-2.5 text-left font-medium transition-colors ${
                isCurrentActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              {menu.name}
            </Link>
          );
        })}
      </nav>

      {/* KELUAR */}
      <div className="border-t border-slate-700 pt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full cursor-pointer rounded-xl border border-red-500/30 bg-red-500/10 py-2 text-center text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
}
