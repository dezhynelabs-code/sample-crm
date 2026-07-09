import { useForm } from 'react-hook-form';
import { useLeads } from '@/context/LeadsContext';
import { useNotifications } from '@/context/NotificationsContext';
import { useToast } from '@/context/ToastContext';
import { Card, CardHeader } from '@/components/ui/Card';

type ProfileFormValues = {
  name: string;
  email: string;
};

// Ported from the #view-settings pane + initSettingsActions() in the
// original app.js. Route-guarded to ADMIN only (see AppRouter).
export function SettingsPage() {
  const { leads } = useLeads();
  const { addSystemNotification } = useNotifications();
  const { showToast } = useToast();

  const { register, handleSubmit } = useForm<ProfileFormValues>({
    defaultValues: { name: 'Admin User', email: 'admin@pipelinecrm.io' },
  });

  function onSaveProfile(values: ProfileFormValues) {
    if (!values.name.trim()) return;
    showToast('Profile configuration saved.');
    addSystemNotification(
      'Profile Configuration Saved',
      `Admin profile metrics set. Active email is ${values.email}.`,
      'info',
    );
  }

  function handleReset() {
    if (
      window.confirm(
        'Are you sure you want to restore Pipeline default mock leads? All custom changes will be deleted.',
      )
    ) {
      localStorage.removeItem('pipeline_leads');
      localStorage.removeItem('pipeline_notifications');
      showToast('Restoring pipeline data...');
      setTimeout(() => window.location.reload(), 600);
    }
  }

  function handleExport() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(leads, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pipeline_leads_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('JSON Database export complete.');
  }

  return (
    <div className="view-pane active">
      <div className="page-header">
        <div>
          <h1>System Settings</h1>
          <p className="page-subtitle">Configure lead routing, user access controls, and restore dashboard defaults.</p>
        </div>
      </div>

      <section className="grid-2">
        <Card span={6}>
          <CardHeader>
            <h3>Profile Settings</h3>
          </CardHeader>
          <form className="settings-form" onSubmit={handleSubmit(onSaveProfile)}>
            <div className="form-group">
              <label>Admin User Name</label>
              <input type="text" className="filter-input w-100" {...register('name')} />
            </div>
            <div className="form-group">
              <label>Notification Email</label>
              <input type="email" className="filter-input w-100" {...register('email')} />
            </div>
            <button type="submit" className="btn btn-primary">
              Save Profile
            </button>
          </form>
        </Card>

        <Card span={6}>
          <CardHeader>
            <h3>System Utilities</h3>
          </CardHeader>
          <div className="settings-actions">
            <p className="card-sub">Perform administrative actions to inspect or clear the dashboard state.</p>
            <div className="settings-buttons">
              <button className="btn btn-secondary" onClick={handleReset}>
                Reset Database to Default
              </button>
              <button className="btn btn-secondary" onClick={handleExport}>
                Export Leads (JSON)
              </button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
