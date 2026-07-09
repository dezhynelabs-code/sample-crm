export interface IntegrationDef {
  id: string;
  logoClass: string;
  logoLetter: string;
  title: string;
  description: string;
  initialConnected: boolean;
}

// Ported verbatim from the #integrationsGrid markup in the original
// index.html.
export const INTEGRATIONS: IntegrationDef[] = [
  {
    id: 'meta',
    logoClass: 'meta-logo',
    logoLetter: 'f',
    title: 'Meta Lead Ads',
    description: 'Sync leads collected via Facebook and Instagram Lead Forms instantly into the dashboard pipeline.',
    initialConnected: true,
  },
  {
    id: 'google',
    logoClass: 'google-logo',
    logoLetter: 'G',
    title: 'Google Ads',
    description: 'Import conversion actions and capture Web-to-Lead forms submitted from your Search Ads campaigns.',
    initialConnected: true,
  },
  {
    id: 'zapier',
    logoClass: 'zapier-logo',
    logoLetter: 'Z',
    title: 'Zapier Webhooks',
    description: 'Connect Pipeline to over 5,000 external applications with customized trigger-action workflows.',
    initialConnected: false,
  },
  {
    id: 'slack',
    logoClass: 'slack-logo',
    logoLetter: 'S',
    title: 'Slack Alerts',
    description: 'Send high-priority notifications to Slack channels whenever a lead score breaches 85 points.',
    initialConnected: true,
  },
  {
    id: 'mailchimp',
    logoClass: 'mailchimp-logo',
    logoLetter: 'M',
    title: 'Mailchimp',
    description: 'Add won and qualified leads directly to marketing newsletter lists and customer onboarding flows.',
    initialConnected: false,
  },
];
