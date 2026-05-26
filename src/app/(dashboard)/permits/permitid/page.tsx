import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Permit, TakeActionPayload } from "@/types/permits";
import { getPermitById, takeAction, submitPermit } from "@/lib/permitsApi";
import { PermitStatusBadge } from "@/components/permits/PermitCard";

export default function PermitDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [permit, setPermit] = useState<Permit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [showActionPanel, setShowActionPanel] = useState(false);
  const [selectedAction, setSelectedAction] =
    useState<TakeActionPayload["action"] | null>(null);

  const fetchPermit = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getPermitById(id as string);
      setPermit(data);
    } catch (err: any) {
      setError(err.message || "Failed to load permit");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermit();
  }, [id]);

  const handleSubmit = async () => {
    if (!permit) return;
    try {
      setActionLoading(true);
      await submitPermit(permit.id);
      await fetchPermit();
    } catch (err: any) {
      alert(err.message || "Failed to submit permit");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async () => {
    if (!permit || !selectedAction) return;
    try {
      setActionLoading(true);
      await takeAction(permit.id, { action: selectedAction, comment });
      setShowActionPanel(false);
      setComment("");
      setSelectedAction(null);
      await fetchPermit();
    } catch (err: any) {
      alert(err.message || "Failed to take action");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading permit...</p>
        </div>
      </div>
    );
  }

  if (error || !permit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Permit not found"}</p>
          <button
            onClick={() => router.back()}
            className="text-sm text-emerald-600 hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const actionButtons = [
    {
      action: "approve" as const,
      label: "Approve",
      classes: "bg-emerald-500 hover:bg-emerald-600 text-white",
    },
    {
      action: "reject" as const,
      label: "Reject",
      classes: "bg-red-500 hover:bg-red-600 text-white",
    },
    {
      action: "request_revision" as const,
      label: "Request Revision",
      classes: "bg-orange-500 hover:bg-orange-600 text-white",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                {permit.title}
              </h1>
              {permit.category && (
                <p className="text-sm text-gray-400">{permit.category.name}</p>
              )}
            </div>
            <PermitStatusBadge status={permit.status} />
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Created</p>
              <p className="text-sm text-gray-700 font-medium">
                {new Date(permit.created_at).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            {permit.submitted_at && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Submitted</p>
                <p className="text-sm text-gray-700 font-medium">
                  {new Date(permit.submitted_at).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Permit ID</p>
              <p className="text-sm text-gray-700 font-mono">{permit.id}</p>
            </div>
          </div>

          {/* Description */}
          {permit.description && (
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">
                Description
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {permit.description}
              </p>
            </div>
          )}

          {/* Notes */}
          {permit.notes && (
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">
                Notes
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {permit.notes}
              </p>
            </div>
          )}

          {/* Action Panel */}
          {showActionPanel && (
            <div className="mb-5 p-4 border border-gray-200 rounded-xl bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Add a comment (optional)
              </p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Provide a reason or feedback..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleAction}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? "Processing..." : "Confirm"}
                </button>
                <button
                  onClick={() => {
                    setShowActionPanel(false);
                    setSelectedAction(null);
                    setComment("");
                  }}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Actions Footer */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
            {permit.status === "draft" && (
              <button
                onClick={handleSubmit}
                disabled={actionLoading}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors"
              >
                {actionLoading ? "Submitting..." : "Submit Permit"}
              </button>
            )}

            {["submitted", "under_review"].includes(permit.status) &&
              actionButtons.map(({ action, label, classes }) => (
                <button
                  key={action}
                  onClick={() => {
                    setSelectedAction(action);
                    setShowActionPanel(true);
                  }}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${classes}`}
                >
                  {label}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}