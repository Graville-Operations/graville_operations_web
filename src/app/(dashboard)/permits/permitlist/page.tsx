import { useRouter } from "next/router";
import { Permit, PermitStatus } from "@/types/permits";
import PermitCard, { PermitStatusBadge } from "@/components/permits/PermitCard";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function PermitSkeleton({ count = 6, layout = "grid" }: { count?: number; layout?: "grid" | "list" }) {
  if (layout === "list") {
    return (
      <div className="space-y-3">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
            <div className="flex justify-between mb-3">
              <div className="h-4 bg-gray-100 rounded w-1/3" />
              <div className="h-5 bg-gray-100 rounded w-20" />
            </div>
            <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 h-40 animate-pulse">
          <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
          <div className="h-3 bg-gray-100 rounded w-1/2 mb-6" />
          <div className="h-3 bg-gray-100 rounded w-full mb-2" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ hasFilters, emptyMessage, onClear }: { hasFilters: boolean; emptyMessage: string; onClear?: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="text-gray-500 text-sm">
        {hasFilters ? "No permits match your filters" : emptyMessage}
      </p>
      {hasFilters && onClear && (
        <button onClick={onClear} className="mt-3 text-sm text-emerald-600 hover:underline font-medium">
          Clear filters
        </button>
      )}
    </div>
  );
}

// ─── Table View ───────────────────────────────────────────────────────────────
function PermitTable({ permits, onRefresh }: { permits: Permit[]; onRefresh?: () => void }) {
  const router = useRouter();
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            {["Title", "Category", "Status", "Date", ""].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {permits.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-10 text-gray-400">No permits found</td>
            </tr>
          ) : (
            permits.map((permit) => (
              <tr key={permit.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{permit.title}</td>
                <td className="px-4 py-3 text-gray-500">{permit.category?.name || "—"}</td>
                <td className="px-4 py-3"><PermitStatusBadge status={permit.status} /></td>
                <td className="px-4 py-3 text-gray-500">{new Date(permit.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => router.push(`/permits/${permit.id}`)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    View →
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main PermitList ──────────────────────────────────────────────────────────

export interface PermitListProps {
  permits: Permit[];
  loading: boolean;
  error?: string;
  view?: "grid" | "table" | "list";
  skeletonCount?: number;
  emptyMessage?: string;
  hasFilters?: boolean;
  onRefresh?: () => void;
  onClearFilters?: () => void;
  showFooter?: boolean;
  totalCount?: number;
}

export default function PermitList({
  permits,
  loading,
  error,
  view = "grid",
  skeletonCount = 6,
  emptyMessage = "No permits found",
  hasFilters = false,
  onRefresh,
  onClearFilters,
  showFooter = false,
  totalCount,
}: PermitListProps) {
  if (loading) return <PermitSkeleton count={skeletonCount} layout={view === "list" ? "list" : "grid"} />;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (permits.length === 0) {
    return <EmptyState hasFilters={hasFilters} emptyMessage={emptyMessage} onClear={onClearFilters} />;
  }

  return (
    <>
      {view === "table" ? (
        <PermitTable permits={permits} onRefresh={onRefresh} />
      ) : view === "list" ? (
        <div className="space-y-3">
          {permits.map((permit) => (
            <PermitCard key={permit.id} permit={permit} onRefresh={onRefresh} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {permits.map((permit) => (
            <PermitCard key={permit.id} permit={permit} onRefresh={onRefresh} />
          ))}
        </div>
      )}

      {showFooter && (
        <p className="text-xs text-gray-400 text-center mt-6">
          Showing {permits.length} of {totalCount ?? permits.length} permits
        </p>
      )}
    </>
  );
}