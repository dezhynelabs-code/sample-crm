export type NotificationCategory = 'alert' | 'warning' | 'info';

export interface AppNotification {
  id: string;
  title: string;
  desc: string;
  time: string; // ISO timestamp
  unread: boolean;
  category: NotificationCategory;
}
