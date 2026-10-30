'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';

type NotificationItem = {
  id: number;
  aksi: string;
  judul: string;
  pesan: string;
  isRead: boolean;
  createdAt: string;
  user?: {
    id: number;
    username: string;
  } | null;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  async function loadNotifications() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/notifications', {
        cache: 'no-store',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal memuat notifikasi.');
      }

      setNotifications(Array.isArray(result) ? result : result.notifications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat notifikasi.');
    } finally {
      setLoading(false);
    }
  }

  async function updateNotification(id: number, action: 'read' | 'delete') {
    try {
      const response = await fetch('/api/notifications', {
        method: action === 'read' ? 'PATCH' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action === 'read' ? { id, isRead: true } : { id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal memproses notifikasi.');
      }

      if (action === 'delete') {
        setNotifications((current) => current.filter((item) => item.id !== id));
      } else {
        setNotifications((current) =>
          current.map((item) => (item.id === id ? { ...item, isRead: true } : item))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memproses notifikasi.');
    }
  }

  useEffect(() => {
    let active = true;

    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications', {
          cache: 'no-store',
        });

        if (!response.ok) return;

        const result = await response.json();

        if (active) {
          setNotifications(Array.isArray(result) ? result : (result.notifications ?? []));
        }
      } catch (err) {
        console.error('Gagal mengambil notifikasi:', err);
      }
    };

    void fetchNotifications();

    const interval = setInterval(() => {
      void fetchNotifications();
    }, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  function getActionText(aksi: string) {
    const action = aksi.toLowerCase();

    if (action.includes('hapus') || action.includes('delete') || action.includes('remove')) {
      return 'telah menghapus';
    }

    if (action.includes('edit') || action.includes('update') || action.includes('ubah')) {
      return 'telah mengedit';
    }

    if (
      action.includes('tambah') ||
      action.includes('create') ||
      action.includes('input') ||
      action.includes('insert')
    ) {
      return 'telah menambahkan';
    }

    return 'melakukan aktivitas';
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          const nextOpen = !open;
          setOpen(nextOpen);

          if (nextOpen) {
            void loadNotifications();
          }
        }}
        aria-label="Notifikasi"
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100"
      >
        <Bell size={19} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div>
              <h3 className="font-semibold text-gray-900">Notifikasi</h3>

              <p className="text-xs text-gray-500">{unreadCount} belum dibaca</p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup notifikasi"
              className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>

          {error && (
            <p className="border-b border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500">Memuat notifikasi...</p>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto mb-2 text-gray-300" size={28} />

                <p className="text-sm font-medium text-gray-700">Belum ada notifikasi</p>

                <p className="mt-1 text-xs text-gray-400">
                  Aktivitas penimbangan akan muncul di sini.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`border-b border-gray-100 px-4 py-3 ${
                    item.isRead ? 'bg-white' : 'bg-blue-50/70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        item.isRead ? 'bg-gray-300' : 'bg-blue-500'
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {item.user?.username ?? 'Pengguna tidak diketahui'}{' '}
                        {getActionText(item.aksi)}
                      </p>

                      <p className="mt-1 wrap-break-word text-sm text-gray-600">{item.pesan}</p>

                      <p className="mt-2 text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleString('id-ID')}
                      </p>

                      <div className="mt-2 flex gap-3">
                        {!item.isRead && (
                          <button
                            type="button"
                            onClick={() => void updateNotification(item.id, 'read')}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                          >
                            <CheckCheck size={14} />
                            Tandai dibaca
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => void updateNotification(item.id, 'delete')}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
