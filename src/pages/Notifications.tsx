import React from 'react';
import { formatDistanceToNow, subHours, subDays } from 'date-fns';
import { Bell, UserPlus, CheckCircle, AlertTriangle } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'new_lead', title: 'New High-Score Lead', message: 'Sarah Connor (Score: 92) generated via Landing Page.', time: subHours(new Date(), 1), read: false, icon: UserPlus, color: '#4f46e5' },
  { id: 2, type: 'deal_won', title: 'Deal Won!', message: 'Alex Mercer was moved to Won by Michael.', time: subHours(new Date(), 3), read: false, icon: CheckCircle, color: '#10b981' },
  { id: 3, type: 'sla_breach', title: 'SLA Warning', message: 'Lead #1042 has been untouched for 48 hours.', time: subHours(new Date(), 5), read: true, icon: AlertTriangle, color: '#f59e0b' },
  { id: 4, type: 'system', title: 'System Update', message: 'CRM version 2.1 has been deployed successfully.', time: subDays(new Date(), 1), read: true, icon: Bell, color: '#6b7280' },
  { id: 5, type: 'new_lead', title: 'New Lead', message: 'John Wick generated via Meta Ads.', time: subDays(new Date(), 2), read: true, icon: UserPlus, color: '#4f46e5' },
];

export const Notifications = () => {
  return (
    <div className="animate-[viewFadeIn_0.25s_cubic-bezier(0.4,0,0.2,1)] max-w-3xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-5 mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight m-0 text-ink">Notifications</h1>
          <p className="mt-1 text-[13.5px] text-slate">Stay updated on pipeline activity and system alerts.</p>
        </div>
        <button className="text-[13px] font-semibold text-accent hover:text-accent-hover transition-colors bg-transparent border-none cursor-pointer">
          Mark all as read
        </button>
      </div>

      <div className="bg-paper border border-line rounded-md shadow-card overflow-hidden">
        {MOCK_NOTIFICATIONS.map((notif, index) => {
          const Icon = notif.icon;
          return (
            <div 
              key={notif.id} 
              className={`flex items-start gap-4 p-5 border-b border-line last:border-b-0 transition-colors hover:bg-mist cursor-pointer ${
                notif.read ? 'opacity-70' : 'bg-accent/5'
              }`}
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: `${notif.color}15`, color: notif.color }}
              >
                <Icon size={20} strokeWidth={2.5} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className={`m-0 text-[14px] ${notif.read ? 'font-semibold text-ink' : 'font-bold text-ink'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-[11px] font-mono text-slate shrink-0">
                    {formatDistanceToNow(notif.time, { addSuffix: true })}
                  </span>
                </div>
                <p className="m-0 text-[13px] text-slate leading-relaxed">
                  {notif.message}
                </p>
              </div>
              
              {!notif.read && (
                <div className="w-2.5 h-2.5 rounded-full bg-accent shrink-0 mt-1.5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
