// src/app/(dashboard)/layout.tsx
import DashboardShell from '@/components/layout/dashboard-shell';
import ProtectedRoute from '@/components/layout/protected-route';
import SessionWatcher from '@/components/layout/session-watcher';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <SessionWatcher /> 
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  );
}