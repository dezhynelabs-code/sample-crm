import { NavLink } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { useRole } from '@/context/RoleContext';
import { useNotifications } from '@/context/NotificationsContext';
import { ROLES } from '@/lib/constants';
import type { NavView, RoleId } from '@/types/role';

interface NavItemDef {
  view: NavView;
  path: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItemDef[] = [
  { view: 'dashboard', path: '/', icon: '▤', label: 'Dashboard' },
  { view: 'leads', path: '/leads', icon: '☰', label: 'Leads' },
  { view: 'campaigns', path: '/campaigns', icon: '◧', label: 'Campaigns' },
  { view: 'analytics', path: '/analytics', icon: '◔', label: 'Analytics' },
  { view: 'integrations', path: '/integrations', icon: '◈', label: 'Integrations' },
  { view: 'notifications', path: '/notifications', icon: '◉', label: 'Notifications' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
}

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const { currentRole, setCurrentRole, roleDefinition, isViewAllowed } = useRole();
  const { unreadCount } = useNotifications();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-top">
        <div className="logo">
          <span className="logo-mark">◆</span>
          <span className="logo-text">Pipeline</span>
        </div>
        <button className="collapse-btn" onClick={onToggleCollapse} title="Collapse sidebar">
          ⟨⟨
        </button>
      </div>

      <nav className="nav">
        {NAV_ITEMS.filter((item) => isViewAllowed(item.view)).map((item) => (
          <NavLink
            key={item.view}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.view === 'notifications' && unreadCount > 0 && (
              <span className="nav-badge">{unreadCount}</span>
            )}
          </NavLink>
        ))}

        <div className="nav-divider" />

        {isViewAllowed('settings') && (
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">⚙</span>
            <span className="nav-label">Settings</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-bottom">
        <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle theme">
          <span className="theme-toggle-icon">{theme === 'dark' ? '🌙' : '☀️'}</span>
          <span className="theme-toggle-label">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>

        <div className="user-chip">
          <div className="avatar">{roleDefinition.name.charAt(0)}</div>
          <div className="user-meta">
            <div className="user-name">{roleDefinition.name}</div>
            <div className="user-role">{roleDefinition.label}</div>
          </div>
        </div>

        <div className="role-switcher-wrap">
          <label className="role-switcher-label" htmlFor="roleSwitcher">
            Viewing as
          </label>
          <select
            id="roleSwitcher"
            className="role-switcher-select"
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as RoleId)}
          >
            <option value="ADMIN">{ROLES.ADMIN.label}</option>
            <option value="MANAGER">{ROLES.MANAGER.label}</option>
            <option value="SALES_EXEC">{ROLES.SALES_EXEC.label}</option>
          </select>
        </div>
      </div>
    </aside>
  );
}
