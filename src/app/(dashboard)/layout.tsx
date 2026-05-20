import Sidebar from '@/components/layout/sidebar';
import ProtectedRoute from '@/components/layout/protected-route';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen min-h-screen">
        {/* Decorative blobs */}
        <div className="fixed top-20 left-72 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-20 right-20 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <Sidebar />
        <main className="relative flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}