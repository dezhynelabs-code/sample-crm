import { useNavigate } from 'react-router-dom';
import { GlobalSearch } from './GlobalSearch';
import { useNotifications } from '@/context/NotificationsContext';
import { useRole } from '@/context/RoleContext';

interface TopbarProps {
  onToggleMobileSidebar: () => void;
}

export function Topbar({ onToggleMobileSidebar }: TopbarProps) {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { roleDefinition } = useRole();

  return (
    <header className="topbar">
      <button className="hamburger" onClick={onToggleMobileSidebar}>
        ☰
      </button>

      <GlobalSearch />

      <div className="topbar-right">
        <button className="icon-btn" title="Notifications" onClick={() => navigate('/notifications')}>
          🔔
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </button>
        <div className="topbar-avatar">{roleDefinition.name.charAt(0)}</div>
      </div>
    </header>
  );
}
