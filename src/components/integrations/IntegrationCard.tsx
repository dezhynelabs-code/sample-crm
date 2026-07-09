import { useState } from 'react';
import type { IntegrationDef } from '@/lib/integrationsData';
import { useRole } from '@/context/RoleContext';
import { useNotifications } from '@/context/NotificationsContext';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';

// Ported from the .integration-card markup + initIntegrationsToggles() in
// the original app.js.
export function IntegrationCard({ integration }: { integration: IntegrationDef }) {
  const [connected, setConnected] = useState(integration.initialConnected);
  const { currentRole } = useRole();
  const { addSystemNotification } = useNotifications();
  const { showToast } = useToast();

  const isAdmin = currentRole === 'ADMIN';

  function handleToggle() {
    const next = !connected;
    setConnected(next);
    if (next) {
      showToast(`${integration.title} service successfully linked.`);
      addSystemNotification('Integration Connected', `Synced pipeline with ${integration.title}.`, 'info');
    } else {
      showToast(`${integration.title} service unlinked.`);
      addSystemNotification('Integration Unlinked', `Pipeline disconnected from ${integration.title}.`, 'warning');
    }
  }

  return (
    <Card span={4} className="integration-card" style={{ opacity: isAdmin ? undefined : 0.85 }}>
      <div className="integration-header">
        <div className={`integration-logo ${integration.logoClass}`}>{integration.logoLetter}</div>
        <label className="switch">
          <input type="checkbox" checked={connected} disabled={!isAdmin} onChange={handleToggle} />
          <span className="slider" />
        </label>
      </div>
      <h3>{integration.title}</h3>
      <p>{integration.description}</p>
      <div className={`integration-status ${connected ? 'connected' : 'disconnected'}`}>
        {connected ? 'Connected' : 'Disconnected'}
      </div>
    </Card>
  );
}
