import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { generateMockNotifications } from '@/lib/mockData';
import type { AppNotification, NotificationCategory } from '@/types/notification';

const STORAGE_KEY = 'pipeline_notifications';

function readLocal(): AppNotification[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  const seeded = generateMockNotifications();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function writeLocal(notifications: AppNotification[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

export async function fetchNotifications(): Promise<AppNotification[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('time', { ascending: false });
    if (error) throw error;
    return data as AppNotification[];
  }
  return readLocal();
}

export async function insertNotification(
  title: string,
  desc: string,
  category: NotificationCategory = 'info',
): Promise<AppNotification> {
  const notification: AppNotification = {
    id: 'notif_' + Math.floor(Math.random() * 10000000),
    title,
    desc,
    time: new Date().toISOString(),
    unread: true,
    category,
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('notifications').insert(notification).select().single();
    if (error) throw error;
    return data as AppNotification;
  }

  const all = readLocal();
  writeLocal([notification, ...all]);
  return notification;
}

export async function markNotificationRead(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('notifications').update({ unread: false }).eq('id', id);
    if (error) throw error;
    return;
  }
  const all = readLocal();
  writeLocal(all.map((n) => (n.id === id ? { ...n, unread: false } : n)));
}

export async function deleteNotificationRecord(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  writeLocal(readLocal().filter((n) => n.id !== id));
}

export async function clearAllNotifications(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('notifications').delete().neq('id', '');
    if (error) throw error;
    return;
  }
  writeLocal([]);
}
