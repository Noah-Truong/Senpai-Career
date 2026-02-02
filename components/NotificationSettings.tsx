"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession } from "@/contexts/AuthContext";

interface NotificationSettingsData {
  email_notifications_enabled: boolean;
  notification_email: string;
  notification_frequency: "immediate" | "weekly_summary" | "off";
  email_application_updates: boolean;
  email_message_notifications: boolean;
  email_meeting_notifications: boolean;
  email_internship_postings: boolean;
}

interface NotificationSettingsProps {
  initialSettings?: NotificationSettingsData | null;
  isLoading?: boolean;
}

export default function NotificationSettings({
  initialSettings,
  isLoading: externalLoading
}: NotificationSettingsProps) {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [settings, setSettings] = useState<NotificationSettingsData | null>(initialSettings || null);
  const [loading, setLoading] = useState(externalLoading ?? !initialSettings);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Update settings when initial data arrives (from prefetch)
  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
      setLoading(false);
    }
  }, [initialSettings]);

  // Update loading state from external source
  useEffect(() => {
    if (externalLoading !== undefined) {
      setLoading(externalLoading);
    }
  }, [externalLoading]);

  // Only fetch if no initial data provided
  useEffect(() => {
    if (!initialSettings && !externalLoading) {
      loadSettings();
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const response = await fetch("/api/notification-settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setSuccess(false);
    try {
      const response = await fetch("/api/notification-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailNotificationsEnabled: settings.email_notifications_enabled,
          notificationEmail: settings.notification_email,
          notificationFrequency: settings.notification_frequency,
          emailApplicationUpdates: settings.email_application_updates,
          emailMessageNotifications: settings.email_message_notifications,
          emailMeetingNotifications: settings.email_meeting_notifications,
          emailInternshipPostings: settings.email_internship_postings,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error saving notification settings:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card-gradient p-8">
        <p style={{ color: '#6B7280' }}>{t("common.loading")}</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="card-gradient p-8">
        <p style={{ color: '#6B7280' }}>{t("profile.settings.error") || "Failed to load settings"}</p>
      </div>
    );
  }

  return (
    <div className="card-gradient p-8 space-y-6">
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {t("profile.settings.saved") || "Settings saved successfully!"}
        </div>
      )}

      {/* Email Notifications Toggle */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              {t("profile.settings.emailNotifications") || "Email Notifications"}
            </h3>
            <p className="text-sm text-gray-600">
              {t("profile.settings.emailNotificationsDesc") || "Receive email notifications for important updates"}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.email_notifications_enabled}
              onChange={(e) =>
                setSettings({ ...settings, email_notifications_enabled: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Email Address */}
        {settings.email_notifications_enabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("profile.settings.notificationEmail") || "Notification Email Address"}
            </label>
            <input
              type="email"
              value={settings.notification_email || ""}
              onChange={(e) =>
                setSettings({ ...settings, notification_email: e.target.value })
              }
              placeholder={session?.user?.email || "your.email@example.com"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              style={{ color: '#000000' }}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t("profile.settings.emailHint") || "Leave empty to use your account email"}
            </p>
          </div>
        )}

        {/* Notification Frequency */}
        {settings.email_notifications_enabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("profile.settings.frequency") || "Notification Frequency"}
            </label>
            <select
              value={settings.notification_frequency}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notification_frequency: e.target.value as "immediate" | "weekly_summary" | "off",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              style={{ color: '#000000' }}
            >
              <option value="immediate">
                {t("profile.settings.frequency.immediate") || "Immediate"}
              </option>
              <option value="weekly_summary">
                {t("profile.settings.frequency.weeklySummary") || "Weekly Summary"}
              </option>
              <option value="off">
                {t("profile.settings.frequency.off") || "Off"}
              </option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {settings.notification_frequency === "weekly_summary" &&
                (t("profile.settings.weeklySummaryHint") ||
                  "You'll receive a summary of all notifications once per week")}
              {settings.notification_frequency === "immediate" &&
                (t("profile.settings.immediateHint") ||
                  "Emails will be sent immediately (may be delayed during late-night hours)")}
            </p>
          </div>
        )}

        {/* Category Preferences */}
        {settings.email_notifications_enabled && (
          <div className="space-y-3 pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
            <h4 className="font-medium text-gray-900">
              {t("profile.settings.categories") || "Notification Categories"}
            </h4>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.email_application_updates}
                onChange={(e) =>
                  setSettings({ ...settings, email_application_updates: e.target.checked })
                }
                className="mr-3 h-4 w-4"
              />
              <span className="text-sm text-gray-700">
                {t("profile.settings.category.applicationUpdates") || "Application Status Updates"}
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.email_message_notifications}
                onChange={(e) =>
                  setSettings({ ...settings, email_message_notifications: e.target.checked })
                }
                className="mr-3 h-4 w-4"
              />
              <span className="text-sm text-gray-700">
                {t("profile.settings.category.messages") || "New Messages"}
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.email_meeting_notifications}
                onChange={(e) =>
                  setSettings({ ...settings, email_meeting_notifications: e.target.checked })
                }
                className="mr-3 h-4 w-4"
              />
              <span className="text-sm text-gray-700">
                {t("profile.settings.category.meetings") || "Meeting Updates"}
              </span>
            </label>

            {session?.user?.role === "student" && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.email_internship_postings}
                  onChange={(e) =>
                    setSettings({ ...settings, email_internship_postings: e.target.checked })
                  }
                  className="mr-3 h-4 w-4"
                />
                <span className="text-sm text-gray-700">
                  {t("profile.settings.category.internshipPostings") || "New Internship Postings"}
                </span>
              </label>
            )}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-6 py-2 disabled:opacity-50"
        >
          {saving ? t("common.loading") : t("button.save") || "Save Settings"}
        </button>
      </div>
    </div>
  );
}
