import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { RoleProvider } from '@/context/RoleContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { LeadsProvider } from '@/context/LeadsContext';
import { CampaignsProvider } from '@/context/CampaignsContext';
import { OverlaysProvider } from '@/context/OverlaysContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { RoleGuardedRoute } from '@/routes/RoleGuardedRoute';
import { DashboardPage } from '@/pages/DashboardPage';
import { LeadsPage } from '@/pages/LeadsPage';
import { CampaignsPage } from '@/pages/CampaignsPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { IntegrationsPage } from '@/pages/IntegrationsPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { SettingsPage } from '@/pages/SettingsPage';

const queryClient = new QueryClient();

/*
 * Provider order matters here: each provider can only consume contexts
 * declared *outside* it. Toast and Role sit outermost since Notifications/
 * Leads/Campaigns all need to show toasts and (for Leads) scope by role.
 * Notifications sits before Leads/Campaigns because both of those fire
 * system notifications on create (matching the original app.js's
 * addSystemNotification() calls from within addLead()/addCampaign()).
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <RoleProvider>
            <NotificationsProvider>
              <LeadsProvider>
                <CampaignsProvider>
                  <OverlaysProvider>
                    <BrowserRouter>
                      <Routes>
                        <Route element={<AppLayout />}>
                          <Route index element={<DashboardPage />} />
                          <Route path="leads" element={<LeadsPage />} />
                          <Route
                            path="campaigns"
                            element={
                              <RoleGuardedRoute view="campaigns">
                                <CampaignsPage />
                              </RoleGuardedRoute>
                            }
                          />
                          <Route path="analytics" element={<AnalyticsPage />} />
                          <Route
                            path="integrations"
                            element={
                              <RoleGuardedRoute view="integrations">
                                <IntegrationsPage />
                              </RoleGuardedRoute>
                            }
                          />
                          <Route path="notifications" element={<NotificationsPage />} />
                          <Route
                            path="settings"
                            element={
                              <RoleGuardedRoute view="settings">
                                <SettingsPage />
                              </RoleGuardedRoute>
                            }
                          />
                        </Route>
                      </Routes>
                    </BrowserRouter>
                  </OverlaysProvider>
                </CampaignsProvider>
              </LeadsProvider>
            </NotificationsProvider>
          </RoleProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
