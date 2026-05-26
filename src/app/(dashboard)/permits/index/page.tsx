import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Permit, PermitStatus } from "@/types/permits";
import { getAllPermits } from "@/lib/permitsApi";
import PermitList from "@/components/permits/PermitList";

export default function AllPermitsPage() {
  const router = useRouter();
  const [permits, setPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PermitStatus | "all">("all");
  const [view, setView] = useState<"grid" | "table">("grid");

  const fetchPermits = async () => {
    try {
      setLoading(true);
      setPermits(await getAllPermits());
    } catch (err: any) {
      setError(err.message || "Failed to load permits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPermits(); }, []);

  const filtered = permits.filter((p) => {
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const counts = permits.reduce((acc, p) => ({ ...acc, [p.status]: (acc[p.status] || 0) + 1 }), {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Permits</h1>
            <p className="text-sm text-gray-500 mt-0.5">System-wide permit overview</p>
          </div>
          <div className="flex gap-2">
            {(["grid", "table"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`p-2 rounded-lg border transition-colors ${view === v ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}
              >
                {v === "grid" ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total",          count: permits.length,                                              color: "bg-gray-900" },
              { label: "Pending Review", count: (counts.submitted || 0) + (counts.under_review || 0),        color: "bg-yellow-500" },
              { label: "Approved",       count: counts.approved  || 0,                                       color: "bg-emerald-500" },
              { label: "Rejected",       count: counts.rejected  || 0,                                       color: "bg-red-500" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className={`w-2 h-2 rounded-full ${s.color} mb-2`} />
                <p className="text-2xl font-bold text-gray-900">{s.count}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or ID..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PermitStatus | "all")}
            className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="revision_requested">Revision Requested</option>
          </select>
        </div>

        <PermitList
          permits={filtered}
          loading={loading}
          error={error}
          view={view}
          skeletonCount={9}
          hasFilters={statusFilter !== "all" || !!search}
          emptyMessage="No permits in the system yet"
          onRefresh={fetchPermits}
          onClearFilters={() => { setStatusFilter("all"); setSearch(""); }}
          showFooter
          totalCount={permits.length}
        />
      </div>
    </div>
  );
}