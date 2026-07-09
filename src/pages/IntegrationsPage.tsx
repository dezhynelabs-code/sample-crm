import { INTEGRATIONS } from '@/lib/integrationsData';
import { IntegrationCard } from '@/components/integrations/IntegrationCard';

// Ported from the #view-integrations pane in the original index.html.
export function IntegrationsPage() {
  return (
    <div className="view-pane active">
      <div className="page-header">
        <div>
          <h1>Integrations Marketplace</h1>
          <p className="page-subtitle">Connect and sync external lead generation platforms directly to Pipeline.</p>
        </div>
      </div>

      <section className="grid-2">
        {INTEGRATIONS.map((integration) => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </section>
    </div>
  );
}
