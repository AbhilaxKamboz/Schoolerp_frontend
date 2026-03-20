import { useEffect, useState } from "react";
import API from "../../api/api";
import { successAlert, errorAlert } from "../../utils/swal";
import { FaSave, FaBook, FaMoneyBill, FaCalendar, FaSync } from "react-icons/fa";

export default function LibrarySettings() {
  const [settings, setSettings] = useState({
    maxBooksPerStudent: 3,
    loanPeriodDays: 14,
    finePerDay: 5,
    allowRenewals: true,
    maxRenewals: 2
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await API.get("/librarian/settings");
      setSettings(res.data.settings);
    } catch (err) {
      errorAlert("Error", "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await API.put("/librarian/settings", settings);
      successAlert("Success", "Settings saved successfully");
    } catch (err) {
      errorAlert("Error", "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
        Library Settings
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        {/* Max Books Per Student */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-gray-700 font-medium">
            <FaBook className="text-purple-600" />
            Maximum Books Per Student
          </label>
          <input
            type="number"
            name="maxBooksPerStudent"
            value={settings.maxBooksPerStudent}
            onChange={handleChange}
            min="1"
            max="10"
            className="w-full md:w-1/3 border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <p className="text-sm text-gray-500">
            Maximum number of books a student can issue at once
          </p>
        </div>

        {/* Loan Period */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-gray-700 font-medium">
            <FaCalendar className="text-purple-600" />
            Loan Period (Days)
          </label>
          <input
            type="number"
            name="loanPeriodDays"
            value={settings.loanPeriodDays}
            onChange={handleChange}
            min="1"
            max="60"
            className="w-full md:w-1/3 border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <p className="text-sm text-gray-500">
            Number of days a book can be issued for
          </p>
        </div>

        {/* Fine Per Day */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-gray-700 font-medium">
            <FaMoneyBill className="text-purple-600" />
            Fine Per Day (₹)
          </label>
          <input
            type="number"
            name="finePerDay"
            value={settings.finePerDay}
            onChange={handleChange}
            min="0"
            step="1"
            className="w-full md:w-1/3 border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <p className="text-sm text-gray-500">
            Fine amount per day for overdue books
          </p>
        </div>

        {/* Allow Renewals */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-gray-700 font-medium">
            <FaSync className="text-purple-600" />
            Allow Renewals
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="allowRenewals"
                checked={settings.allowRenewals === true}
                onChange={() => setSettings(prev => ({ ...prev, allowRenewals: true }))}
                className="w-4 h-4 text-purple-600"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="allowRenewals"
                checked={settings.allowRenewals === false}
                onChange={() => setSettings(prev => ({ ...prev, allowRenewals: false }))}
                className="w-4 h-4 text-purple-600"
              />
              <span>No</span>
            </label>
          </div>
        </div>

        {/* Max Renewals */}
        {settings.allowRenewals && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-700 font-medium">
              <FaSync className="text-purple-600" />
              Maximum Renewals
            </label>
            <input
              type="number"
              name="maxRenewals"
              value={settings.maxRenewals}
              onChange={handleChange}
              min="1"
              max="5"
              className="w-full md:w-1/3 border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-sm text-gray-500">
              Maximum number of times a book can be renewed
            </p>
          </div>
        )}

        {/* Save Button */}
        <div className="pt-4 border-t">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            <FaSave /> {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}