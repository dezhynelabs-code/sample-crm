import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AppNotification, NotificationCategory } from '@/types/notification';
import {
  fetchNotifications,
  insertNotification,
  markNotificationRead,
  deleteNotificationRecord,
  clearAllNotifications,
} from '@/lib/repositories/notificationsRepository';
import { useToast } from './ToastContext';

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  addSystemNotification: (title: string, desc: string, category?: NotificationCategory) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  clearOne: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchNotifications()
      .then(setNotifications)
      .finally(() => setLoading(false));
  }, []);

  const addSystemNotification = useCallback(
    async (title: string, desc: string, category: NotificationCategory = 'info') => {
      const created = await insertNotification(title, desc, category);
      setNotifications((prev) => [created, ...prev]);
    },
    [],
  );

  const markAsRead = useCallback(async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  }, []);

  const clearOne = useCallback(
    async (id: string) => {
      await deleteNotificationRecord(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      showToast('Notification cleared.');
    },
    [showToast],
  );

  const clearAll = useCallback(async () => {
    await clearAllNotifications();
    setNotifications([]);
    showToast('All notifications cleared.');
  }, [showToast]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, loading, addSystemNotification, markAsRead, clearOne, clearAll }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationsProvider');
  return ctx;
}
