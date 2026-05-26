import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Permit } from "@/types/permits";
import { getPendingPermits, takeAction } from "@/lib/permitsApi";
import { PermitStatusBadge } from "@/components/permits/PermitCard";
import PermitList from "@/components/permits/PermitList";

// ─── Action Modal ─────────────────────────────────────────────────────────────
const ACTIONS = [
  { value: "approve",          label: "✅ Approve",          desc: "Mark this permit as approved",         color: "border-emerald-500 bg-emerald-50" },
  { value: "reject",           label: "❌ Reject",           desc: "Deny this permit application",         color: "border-red-500 bg-red-50" },
  { value: "request_revision", label: "✏️ Request Revision", desc: "Ask applicant to revise and resubmit", color: "border-orange-500 bg-orange-50" },
] as const;

function ActionModal({ permit, onClose, onSuccess }: { permit: Permit; onClose: () => void; onSuccess: () => void }) {
  const [action, setAction] = useState<typeof ACTIONS[number]["value"]>("approve");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      await takeAction(permit.id, { action, comment });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to take action");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-bold text-gray-900">Take Action</h2>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{permit.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {ACTIONS.map((opt) => (
            <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${action === opt.value ? opt.color : "border-gray-100 hover:border-gray-200"}`}>
              <input type="radio" name="action" value={opt.value} checked={action === opt.value} onChange={() => setAction(opt.value)} className="mt-0.5 accent-emerald-500" />
              <div>
                <p className="text-sm font-medium text-gray-800">{opt.label}</p>
                <p className="text-xs text-gray-500">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment (optional)..." rows={3} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none mb-4" />

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <div className="flex gap-2">
          <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
            {loading ? "Processing..." : "Confirm Action"}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:border-gray-300 transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pending Row ──────────────────────────────────────────────────────────────
function PendingRow({ permit, onReview }: { permit: Permit; onReview: (p: Permit) => void }) {
  const router = useRouter();
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{permit.title}</h3>
            <PermitStatusBadge status={permit.status} />
          </div>
          {permit.category && <p className="text-xs text-gray-400 mb-2">{permit.category.name}</p>}
          {permit.description && <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{permit.description}</p>}
          <p className="text-[11px] text-gray-400 mt-2">
            Submitted {new Date(permit.submitted_at || permit.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button onClick={() => onReview(permit)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors">
            Review
          </button>
          <button onClick={() => router.push(`/permits/${permit.id}`)} className="px-4 py-2 text-xs text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 transition text-center">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PendingPermitsPage() {
  const [permits, setPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Permit | null>(null);

  const fetchPermits = async () => {
    try {
      setLoading(true);
      setPermits(await getPendingPermits());
    } catch (err: any) {
      setError(err.message || "Failed to load pending permits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPermits(); }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {selected && (
        <ActionModal permit={selected} onClose={() => setSelected(null)} onSuccess={() => { setSelected(null); fetchPermits(); }} />
      )}

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
            {!loading && permits.length > 0 && (
              <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2.5 py-1 rounded-full">{permits.length}</span>
            )}
          </div>
          <p className="text-sm text-gray-500">Permits awaiting your review and decision</p>
        </div>

        {/* Custom list — pending rows have unique Review/View buttons so we render manually */}
        {loading ? (
          <PermitList permits={[]} loading={true} skeletonCount={4} view="list" />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-sm text-red-600">{error}</div>
        ) : permits.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">All clear!</h3>
            <p className="text-sm text-gray-500">No permits pending your approval</p>
          </div>
        ) : (
          <div className="space-y-3">
            {permits.map((permit) => (
              <PendingRow key={permit.id} permit={permit} onReview={setSelected} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}