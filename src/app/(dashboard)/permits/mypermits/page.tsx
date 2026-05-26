import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Permit, PermitStatus } from "@/types/permits";
import { getMyPermits } from "@/lib/permitsApi";
import PermitList from "@/components/permits/PermitList";

const STATUS_FILTERS: { label: string; value: PermitStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Submitted", value: "submitted" },
  { label: "Under Review", value: "under_review" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export default function MyPermitsPage() {
  const router = useRouter();
  const [permits, setPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<PermitStatus | "all">("all");
  const [search, setSearch] = useState("");

  const fetchPermits = async () => {
    try {
      setLoading(true);
      setPermits(await getMyPermits());
    } catch (err: any) {
      setError(err.message || "Failed to load permits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPermits(); }, []);

  const filtered = permits.filter((p) => {
    const matchesStatus = filter === "all" || p.status === filter;
    const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const hasFilters = filter !== "all" || !!search;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Permits</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage and track your permit applications</p>
          </div>
          <button
            onClick={() => router.push("/permits/create")}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Permit
          </button>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search permits..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  filter === f.value ? "bg-emerald-500 text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <PermitList
          permits={filtered}
          loading={loading}
          error={error}
          hasFilters={hasFilters}
          emptyMessage="You haven't created any permits yet"
          onRefresh={fetchPermits}
          onClearFilters={() => { setFilter("all"); setSearch(""); }}
          showFooter
          totalCount={permits.length}
        />
      </div>
    </div>
  );
}