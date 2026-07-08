import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfiles, updateProfileRole } from '../../api/profiles';
import { Shield, Loader2, Check } from 'lucide-react';

export const RolesManager = () => {
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: getProfiles,
  });

  const mutation = useMutation({
    mutationFn: updateProfileRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center">
        <Loader2 className="animate-spin text-slate" size={24} />
      </div>
    );
  }

  return (
    <section className="bg-paper border border-line rounded-md shadow-card">
      <div className="px-6 py-5 border-b border-line flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-mist flex items-center justify-center text-accent">
          <Shield size={20} />
        </div>
        <div>
          <h3 className="m-0 text-[16px] font-bold text-ink">Roles & Permissions</h3>
          <p className="m-0 mt-1 text-[13px] text-slate">Manage access levels for all users in your organization.</p>
        </div>
      </div>
      
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-mist border-b border-line">
              <th className="px-6 py-3 text-[11px] font-bold text-slate uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-[11px] font-bold text-slate uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-[11px] font-bold text-slate uppercase tracking-wider">Current Role</th>
              <th className="px-6 py-3 text-[11px] font-bold text-slate uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id} className="border-b border-line last:border-b-0 hover:bg-mist/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {profile.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-[13.5px] text-ink">{profile.full_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[13px] text-slate">
                  {profile.email}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide
                    ${profile.role === 'ADMIN' ? 'bg-accent/10 text-accent' : 
                      profile.role === 'MANAGER' ? 'bg-status-progress-subtle text-status-progress' : 
                      'bg-status-new-subtle text-status-new'}`}
                  >
                    {profile.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <select
                      className="bg-paper border border-line rounded px-3 py-1.5 text-[12px] font-semibold text-ink outline-none focus:border-accent transition-colors cursor-pointer"
                      value={profile.role}
                      onChange={(e) => {
                        mutation.mutate({ id: profile.id, role: e.target.value });
                      }}
                      disabled={mutation.isPending}
                    >
                      <option value="ADMIN">Administrator</option>
                      <option value="MANAGER">Sales Manager</option>
                      <option value="SALES_EXEC">Sales Executive</option>
                    </select>
                    {mutation.isPending && mutation.variables?.id === profile.id && (
                      <Loader2 className="animate-spin text-slate" size={14} />
                    )}
                    {mutation.isSuccess && mutation.variables?.id === profile.id && (
                      <Check className="text-status-success" size={16} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
