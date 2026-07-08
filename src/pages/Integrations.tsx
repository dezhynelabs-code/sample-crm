import React, { useState } from 'react';
import { Mail, MessageSquare, Phone, Calendar, Video, Share2, Share, MessageCircle, Database, Cloud, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';

const INTEGRATIONS = [
  { id: 'google_workspace', name: 'Google Workspace', category: 'Productivity', icon: Mail, color: '#EA4335', connected: true },
  { id: 'slack', name: 'Slack', category: 'Communication', icon: MessageSquare, color: '#E01E5A', connected: true },
  { id: 'zoom', name: 'Zoom', category: 'Video Conferencing', icon: Video, color: '#2D8CFF', connected: false },
  { id: 'meta_ads', name: 'Meta Ads', category: 'Marketing', icon: Share, color: '#1877F2', connected: true },
  { id: 'twitter_ads', name: 'X / Twitter Ads', category: 'Marketing', icon: MessageCircle, color: '#1DA1F2', connected: false },
  { id: 'mailchimp', name: 'Mailchimp', category: 'Marketing', icon: Share2, color: '#FFE01B', connected: false },
  { id: 'hubspot', name: 'HubSpot', category: 'CRM', icon: Database, color: '#FF7A59', connected: false },
  { id: 'salesforce', name: 'Salesforce', category: 'CRM', icon: Cloud, color: '#00A1E0', connected: false },
  { id: 'calendly', name: 'Calendly', category: 'Productivity', icon: Calendar, color: '#006BFF', connected: true },
  { id: 'twilio', name: 'Twilio', category: 'Communication', icon: Phone, color: '#F22F46', connected: false },
];

export const Integrations = () => {
  const { profile } = useAuth();
  const [integrations, setIntegrations] = useState(INTEGRATIONS);

  if (profile?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-slate">
        <ShieldAlert size={48} className="text-status-danger" />
        <h2 className="text-xl font-bold text-ink">Permission Denied</h2>
        <p>Only Administrators can access the Integrations Directory.</p>
      </div>
    );
  }

  const toggleConnection = (id: string) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === id 
          ? { ...integration, connected: !integration.connected } 
          : integration
      )
    );
  };

  return (
    <div className="animate-[viewFadeIn_0.25s_cubic-bezier(0.4,0,0.2,1)]">
      <div className="flex flex-wrap items-end justify-between gap-5 mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight m-0 text-ink">Integrations Directory</h1>
          <p className="mt-1 text-[13.5px] text-slate">Connect external tools to automate workflows and sync data.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          
          return (
            <div key={integration.id} className="bg-paper border border-line rounded-md shadow-card p-5 relative transition-all duration-fast hover:-translate-y-0.5 hover:shadow-modal flex flex-col h-[180px]">
              <div className="flex justify-between items-start mb-4">
                <div 
                  className="w-10 h-10 rounded-md flex items-center justify-center shrink-0" 
                  style={{ backgroundColor: `${integration.color}15`, color: integration.color }}
                >
                  <Icon size={22} strokeWidth={2} />
                </div>
                
                {/* Custom Toggle Switch */}
                <button 
                  onClick={() => toggleConnection(integration.id)}
                  className={clsx(
                    "w-11 h-6 rounded-full relative transition-colors duration-fast cursor-pointer shrink-0 border-none outline-none",
                    integration.connected ? "bg-accent" : "bg-line"
                  )}
                >
                  <span className={clsx(
                    "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-fast",
                    integration.connected ? "translate-x-5 shadow-[0_2px_4px_rgba(0,0,0,0.2)]" : "translate-x-0 shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
                  )} />
                </button>
              </div>
              
              <div className="mt-auto">
                <h3 className="m-0 text-[15px] font-bold text-ink mb-1">{integration.name}</h3>
                <div className="text-[12px] text-slate">{integration.category}</div>
              </div>
              
              <div className={clsx(
                "absolute top-5 right-16 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm transition-opacity",
                integration.connected ? "opacity-100 text-status-won bg-[#d1fae5] dark:bg-[#064e3b]" : "opacity-0"
              )}>
                Connected
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
