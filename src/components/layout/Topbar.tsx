import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Topbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { user } = useAuth();
  
  return (
    <header className="h-[var(--topbar-height)] bg-paper border-b border-line flex items-center gap-5 px-8 sticky top-0 z-20 transition-colors duration-base">
      <button 
        className="md:hidden border-none bg-none text-ink cursor-pointer"
        onClick={onMenuClick}
      >
        <Menu size={20} />
      </button>
      
      <div className="flex-1 max-w-[460px] relative">
        <div className="flex items-center gap-2.5 bg-mist rounded-md px-3.5 py-2 border border-transparent transition-all duration-fast focus-within:border-accent focus-within:bg-paper">
          <Search size={16} className="text-slate" />
          <input 
            type="text" 
            placeholder="Search leads, campaigns, people…" 
            className="border-none bg-transparent outline-none flex-1 text-[13.5px] text-ink font-sans placeholder:text-slate"
          />
          <kbd className="font-mono text-[10px] text-slate bg-paper border border-line rounded px-1.5 py-0.5 hidden sm:block">
            ⌘K
          </kbd>
        </div>
      </div>
      
      <div className="ml-auto flex items-center gap-4">
        <button className="relative border-none bg-transparent cursor-pointer w-9 h-9 rounded-full flex items-center justify-center text-ink transition-colors duration-fast hover:bg-mist">
          <Bell size={18} />
          <span className="absolute top-1 right-1 bg-status-danger text-white text-[9px] font-mono min-w-[16px] h-4 rounded-full flex items-center justify-center font-bold">
            3
          </span>
        </button>
        <div className="w-[34px] h-[34px] rounded-full bg-ink text-paper flex items-center justify-center text-[13px] font-bold">
          {user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
};
