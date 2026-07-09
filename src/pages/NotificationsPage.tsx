import { useNotifications } from '@/context/NotificationsContext';
import { Card } from '@/components/ui/Card';
import { timeAgo } from '@/lib/format';

function iconFor(category: string): string {
  if (category === 'warning') return '⚠️';
  if (category === 'info') return 'ℹ️';
  return '🔔';
}

// Ported from the #view-notifications pane + renderNotifications() in the
// original app.js.
export function NotificationsPage() {
  const { notifications, markAsRead, clearOne, clearAll } = useNotifications();

  return (
    <div className="view-pane active">
      <div className="page-header">
        <div>
          <h1>Activity Notifications</h1>
          <p className="page-subtitle">
            Stay updated on lead assignments, performance alerts, and system notifications.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={clearAll}>
            Clear All
          </button>
        </div>
      </div>

      <Card>
        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-slate)' }}>
              <p style={{ fontSize: 16, fontWeight: 550 }}>All caught up!</p>
              <p style={{ fontSize: 12.5, marginTop: 4 }}>No new alerts or system events active right now.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`notif-item ${n.unread ? 'unread' : ''}`}
                onClick={() => n.unread && markAsRead(n.id)}
              >
                <div className="notif-icon-col">{iconFor(n.category)}</div>
                <div className="notif-body">
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-desc">{n.desc}</div>
                  <div className="notif-time">{timeAgo(n.time)}</div>
                </div>
                <button
                  className="notif-clear-item-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearOne(n.id);
                  }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
