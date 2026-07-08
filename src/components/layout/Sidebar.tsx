import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, Users, Megaphone, LineChart, Blocks, Bell, Settings, LogOut, Sun, PanelLeftClose } from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) => {
  const { user, profile } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN', 'MANAGER', 'SALES_EXEC'] },
    { to: '/leads', icon: Users, label: 'Leads', roles: ['ADMIN', 'MANAGER', 'SALES_EXEC'] },
    { to: '/campaigns', icon: Megaphone, label: 'Campaigns', roles: ['ADMIN', 'MANAGER'] },
    { to: '/analytics', icon: LineChart, label: 'Analytics', roles: ['ADMIN', 'MANAGER'] },
    { to: '/integrations', icon: Blocks, label: 'Integrations', roles: ['ADMIN'] },
    { to: '/notifications', icon: Bell, label: 'Notifications', badge: 3, roles: ['ADMIN', 'MANAGER', 'SALES_EXEC'] },
  ];

  const visibleNavItems = navItems.filter(item => profile && item.roles.includes(profile.role));

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={clsx(
        "bg-paper border-r border-line flex flex-col justify-between sticky top-0 h-screen shrink-0 z-50 transition-all duration-panel",
        collapsed ? "w-[72px]" : "w-[260px]",
        mobileOpen ? "fixed left-0 translate-x-0 w-[260px]" : "max-md:fixed max-md:-translate-x-full"
      )}>
        <div className={clsx(
          "flex items-center justify-between border-b border-line h-[64px]",
          collapsed && !mobileOpen ? "flex-col justify-center gap-3 p-4" : "px-5 py-4"
        )}>
          <div className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <rect x="3" y="4" width="18" height="3" rx="1.5" fill="url(#logoGrad)"/>
              <rect x="6" y="10" width="12" height="3" rx="1.5" fill="url(#logoGrad)"/>
              <rect x="9" y="16" width="6" height="3" rx="1.5" fill="url(#logoGrad)"/>
            </svg>
            <span className={clsx("text-ink", collapsed && !mobileOpen && "hidden")}>Pipeline</span>
          </div>
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center p-1.5 rounded-md text-slate hover:bg-mist hover:text-accent transition-colors duration-fast"
            title="Toggle Sidebar"
          >
            <PanelLeftClose size={18} className={clsx("transition-transform duration-fast", collapsed && "rotate-180")} />
          </button>
        </div>

        <nav className="p-4 px-2.5 flex flex-col gap-1 flex-1 overflow-y-auto">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-md text-[13.5px] font-[550] transition-colors duration-fast whitespace-nowrap overflow-hidden relative",
                isActive 
                  ? "bg-accent-subtle text-accent" 
                  : "text-slate hover:bg-mist hover:text-ink"
              )}
            >
              <item.icon size={18} className="shrink-0" />
              <span className={clsx(collapsed && !mobileOpen && "hidden")}>{item.label}</span>
              {item.badge && !collapsed && (
                <span className="absolute right-3 bg-status-danger text-white font-mono text-[10px] font-bold px-1.5 py-[1px] rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
          
          {profile?.role === 'ADMIN' && (
            <>
              <div className="h-px bg-line my-3 mx-1.5" />
              <NavLink
                to="/settings"
                className={({ isActive }) => clsx(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-md text-[13.5px] font-[550] transition-colors duration-fast whitespace-nowrap overflow-hidden relative",
                  isActive ? "bg-accent-subtle text-accent" : "text-slate hover:bg-mist hover:text-ink"
                )}
              >
                <Settings size={18} className="shrink-0" />
                <span className={clsx(collapsed && !mobileOpen && "hidden")}>Settings</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="p-3.5 px-2.5 border-t border-line flex flex-col gap-3">
          <button className={clsx(
            "flex items-center gap-3 p-2.5 bg-mist rounded-md text-ink font-semibold text-[13px] hover:bg-line transition-all active:scale-[0.97]",
            collapsed && !mobileOpen && "justify-center"
          )} title="Toggle theme">
            <Sun size={16} className="shrink-0" />
            <span className={clsx(collapsed && !mobileOpen && "hidden")}>Light Mode</span>
          </button>
          
          <div className="flex items-center gap-2.5 p-1.5">
            <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-semibold text-sm shrink-0">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className={clsx("flex flex-col", collapsed && !mobileOpen && "hidden")}>
              <div className="text-[13px] font-semibold text-ink leading-tight">{user?.email || 'User'}</div>
              <div className="text-[11px] text-slate capitalize">
                {profile?.role ? profile.role.replace('_', ' ').toLowerCase() : 'Loading...'}
              </div>
            </div>
          </div>
          
          <div>
            <button 
              onClick={handleLogout}
              className={clsx(
                "w-full flex items-center gap-2 bg-mist text-ink border border-line rounded-md px-[18px] py-[9px] text-[13px] font-semibold transition-colors duration-fast hover:bg-line",
                collapsed && !mobileOpen && "justify-center px-0"
              )}
            >
              <LogOut size={16} className="shrink-0 text-slate" />
              <span className={clsx(collapsed && !mobileOpen && "hidden")}>Log Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
