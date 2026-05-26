import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { PermitCategory } from "@/types/permits";
import { createPermit, listPermitCategories } from "@/lib/permitsApi";

export default function CreatePermitPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<PermitCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCats, setFetchingCats] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category_id: "",
    notes: "",
  });

  useEffect(() => {
    listPermitCategories()
      .then(setCategories)
      .catch(() => setError("Failed to load categories"))
      .finally(() => setFetchingCats(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent, submitAfter = false) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required");
    if (!form.category_id) return setError("Please select a category");

    try {
      setLoading(true);
      setError("");
      const permit = await createPermit({
        title: form.title,
        description: form.description,
        category_id: form.category_id,
        notes: form.notes,
      });
      router.push(`/permits/${permit.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create permit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Permits
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">New Permit Application</h1>
            </div>
            <p className="text-sm text-gray-500 ml-12">
              Fill in the details below. You can save as draft and submit later.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Permit Title <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Construction Permit for Block B"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              {fetchingCats ? (
                <div className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-400 animate-pulse">
                  Loading categories...
                </div>
              ) : (
                <select
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the purpose and scope of this permit..."
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Any additional information for the reviewer..."
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                {loading ? "Saving..." : "Save as Draft"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:border-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}