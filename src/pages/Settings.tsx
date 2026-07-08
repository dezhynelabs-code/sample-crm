import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Bell, Palette, Globe, Shield, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';
import { RolesManager } from '../components/settings/RolesManager';

type Tab = 'profile' | 'roles';

export const Settings = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  if (profile?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-slate">
        <ShieldAlert size={48} className="text-status-danger" />
        <h2 className="text-xl font-bold text-ink">Permission Denied</h2>
        <p>Only Administrators can access System Settings.</p>
      </div>
    );
  }

  return (
    <div className="animate-[viewFadeIn_0.25s_cubic-bezier(0.4,0,0.2,1)] max-w-5xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-[22px] font-bold tracking-tight m-0 text-ink">Settings</h1>
        <p className="mt-1 text-[13.5px] text-slate">Manage your account, preferences, and organization settings.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation for Settings */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-1">
          <button 
            onClick={() => setActiveTab('profile')}
            className={clsx(
              "flex items-center gap-3 px-4 py-2.5 rounded-md text-[13.5px] font-bold transition-colors text-left border-none cursor-pointer",
              activeTab === 'profile' ? "bg-accent text-white" : "text-slate hover:bg-mist hover:text-ink bg-transparent font-semibold"
            )}
          >
            <User size={18} /> Profile
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-md text-[13.5px] font-semibold text-slate hover:bg-mist hover:text-ink transition-colors text-left border-none bg-transparent">
            <Lock size={18} /> Security
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-md text-[13.5px] font-semibold text-slate hover:bg-mist hover:text-ink transition-colors text-left border-none bg-transparent">
            <Bell size={18} /> Notifications
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-md text-[13.5px] font-semibold text-slate hover:bg-mist hover:text-ink transition-colors text-left border-none bg-transparent">
            <Palette size={18} /> Appearance
          </button>
          
          <div className="my-2 border-t border-line" />
          
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-md text-[13.5px] font-semibold text-slate hover:bg-mist hover:text-ink transition-colors text-left border-none bg-transparent">
            <Globe size={18} /> Organization
          </button>
          <button 
            onClick={() => setActiveTab('roles')}
            className={clsx(
              "flex items-center gap-3 px-4 py-2.5 rounded-md text-[13.5px] font-bold transition-colors text-left border-none cursor-pointer",
              activeTab === 'roles' ? "bg-accent text-white" : "text-slate hover:bg-mist hover:text-ink bg-transparent font-semibold"
            )}
          >
            <Shield size={18} /> Roles & Permissions
          </button>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 flex flex-col gap-6">
          
          {activeTab === 'profile' && (
            <>
              <section className="bg-paper border border-line rounded-md shadow-card">
                <div className="px-6 py-5 border-b border-line">
                  <h3 className="m-0 text-[16px] font-bold text-ink">Personal Information</h3>
                  <p className="m-0 mt-1 text-[13px] text-slate">Update your basic profile information.</p>
                </div>
                <div className="p-6 flex flex-col gap-5">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full bg-accent text-white flex items-center justify-center text-2xl font-bold shadow-md">
                      {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <button className="px-4 py-2 bg-mist border border-line rounded text-[13px] font-semibold text-ink hover:bg-line transition-colors cursor-pointer">
                      Change Avatar
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-semibold text-slate uppercase tracking-wider">Full Name</label>
                      <input type="text" defaultValue={profile?.full_name || "Demo User"} className="bg-paper border border-line rounded px-3 py-2 text-[13.5px] text-ink outline-none focus:border-accent transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-semibold text-slate uppercase tracking-wider">Email Address</label>
                      <input type="email" defaultValue={user?.email} disabled className="bg-mist border border-line rounded px-3 py-2 text-[13.5px] text-slate outline-none cursor-not-allowed" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-semibold text-slate uppercase tracking-wider">Job Title</label>
                      <input type="text" defaultValue={profile?.role?.replace('_', ' ')} disabled className="bg-mist border border-line rounded px-3 py-2 text-[13.5px] text-slate outline-none cursor-not-allowed capitalize" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-semibold text-slate uppercase tracking-wider">Timezone</label>
                      <select className="bg-paper border border-line rounded px-3 py-2 text-[13.5px] text-ink outline-none focus:border-accent transition-colors cursor-pointer">
                        <option>Pacific Time (PT)</option>
                        <option>Eastern Time (ET)</option>
                        <option>Coordinated Universal Time (UTC)</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-line bg-mist flex justify-end">
                  <button className="px-5 py-2 bg-accent text-white rounded text-[13px] font-bold hover:bg-accent-hover transition-colors border-none cursor-pointer">
                    Save Changes
                  </button>
                </div>
              </section>

              <section className="bg-paper border border-line rounded-md shadow-card">
                <div className="px-6 py-5 border-b border-line">
                  <h3 className="m-0 text-[16px] font-bold text-ink">Theme Preferences</h3>
                  <p className="m-0 mt-1 text-[13px] text-slate">Customize the look and feel of your CRM.</p>
                </div>
                <div className="p-6">
                  <div className="flex gap-4">
                    <label 
                      onClick={() => {
                        document.documentElement.removeAttribute('data-theme');
                        localStorage.setItem('theme', 'light');
                      }}
                      className="flex items-center justify-center border-2 border-line hover:border-accent bg-paper hover:bg-mist rounded-md p-4 cursor-pointer flex-1 transition-colors"
                    >
                      <input type="radio" name="theme" defaultChecked={localStorage.getItem('theme') !== 'dark'} className="mr-3" />
                      <span className="text-[14px] font-bold text-ink">Light Mode</span>
                    </label>
                    <label 
                      onClick={() => {
                        document.documentElement.setAttribute('data-theme', 'dark');
                        localStorage.setItem('theme', 'dark');
                      }}
                      className="flex items-center justify-center border-2 border-line hover:border-accent bg-paper hover:bg-mist rounded-md p-4 cursor-pointer flex-1 transition-colors"
                    >
                      <input type="radio" name="theme" defaultChecked={localStorage.getItem('theme') === 'dark'} className="mr-3" />
                      <span className="text-[14px] font-bold text-slate">Dark Mode</span>
                    </label>
                  </div>
                </div>
              </section>

              <section className="bg-paper border border-line rounded-md shadow-card">
                <div className="px-6 py-5 border-b border-line">
                  <h3 className="m-0 text-[16px] font-bold text-ink">System Utilities</h3>
                  <p className="m-0 mt-1 text-[13px] text-slate">Perform administrative actions to inspect or clear the dashboard state.</p>
                </div>
                <div className="p-6 flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => alert('This would reset your database in a real app.')}
                    className="px-5 py-2.5 bg-mist border border-line rounded text-[13.5px] font-semibold text-ink hover:bg-line transition-colors cursor-pointer flex-1 text-center"
                  >
                    Reset Database to Default
                  </button>
                  <button 
                    onClick={() => alert('This would export a JSON file of your leads in a real app.')}
                    className="px-5 py-2.5 bg-mist border border-line rounded text-[13.5px] font-semibold text-ink hover:bg-line transition-colors cursor-pointer flex-1 text-center"
                  >
                    Export Leads (JSON)
                  </button>
                </div>
              </section>
            </>
          )}

          {activeTab === 'roles' && (
            <RolesManager />
          )}

        </div>
      </div>
    </div>
  );
};
