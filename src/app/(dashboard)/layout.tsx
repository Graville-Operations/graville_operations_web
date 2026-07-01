// src/app/(dashboard)/layout.tsx
import Sidebar from '@/components/layout/sidebar';
import ProtectedRoute from '@/components/layout/protected-route';
import SessionWatcher from '@/components/layout/session-watcher';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <SessionWatcher /> 
      <div className="flex h-screen ...">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}