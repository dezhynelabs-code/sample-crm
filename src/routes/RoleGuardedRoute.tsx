import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from '@/context/RoleContext';
import type { NavView } from '@/types/role';

interface RoleGuardedRouteProps {
  view: NavView;
  children: ReactNode;
}

// Safety net matching the sidebar's own nav gating — ported from the
// role-check at the top of navigateToView() in the original app.js. Even
// if a disallowed route were reached directly (typed URL, stale link),
// this redirects to the dashboard instead of rendering the page.
export function RoleGuardedRoute({ view, children }: RoleGuardedRouteProps) {
  const { isViewAllowed } = useRole();
  if (!isViewAllowed(view)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
