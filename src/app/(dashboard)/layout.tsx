import TopNav from '@/components/layout/top-nav';
import ProtectedRoute from '@/components/layout/protected-route';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#1a3a6e_0%,_#0a0f1e_60%,_#000000_100%)]">
        {/* Decorative blobs */}
        <div className="fixed top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-20 right-20 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <TopNav />
        <main className="relative max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}