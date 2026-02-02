"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession } from "@/contexts/AuthContext";
import NotificationSettings from "./NotificationSettings";

export interface UserSettingsData {
  language_preference: string;
  theme_preference: string;
  timezone: string;
  profile_visibility: string;
  show_email: boolean;
  show_phone: boolean;
  allow_messages_from: string;
  email_updates: boolean;
  two_factor_enabled: boolean;
}

export interface NotificationSettingsData {
  email_notifications_enabled: boolean;
  notification_email: string;
  notification_frequency: "immediate" | "weekly_summary" | "off";
  email_application_updates: boolean;
  email_message_notifications: boolean;
  email_meeting_notifications: boolean;
  email_internship_postings: boolean;
}

interface UserSettingsProps {
  initialSettings?: UserSettingsData | null;
  initialNotificationSettings?: NotificationSettingsData | null;
  isLoading?: boolean;
}

export default function UserSettings({
  initialSettings,
  initialNotificationSettings,
  isLoading: externalLoading
}: UserSettingsProps) {
  const { t, language, setLanguage } = useLanguage();
  const { data: session } = useSession();
  const [settings, setSettings] = useState<UserSettingsData | null>(initialSettings || null);
  const [loading, setLoading] = useState(externalLoading ?? !initialSettings);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState<"general" | "privacy" | "notifications">("general");

  // Update settings when initial data arrives (from prefetch)
  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
      setLoading(false);
      // Only sync language from DB if localStorage doesn't have a saved preference
      // This prevents overriding the user's current session language choice
      if (typeof window !== "undefined") {
        const localLanguage = localStorage.getItem("language");
        if (!localLanguage && (initialSettings.language_preference === "en" || initialSettings.language_preference === "ja")) {
          setLanguage(initialSettings.language_preference);
        }
      }
    }
  }, [initialSettings, setLanguage]);

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
      const response = await fetch("/api/user-settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        // Only sync language from DB if localStorage doesn't have a saved preference
        if (typeof window !== "undefined") {
          const localLanguage = localStorage.getItem("language");
          if (!localLanguage && data.settings?.language_preference && (data.settings.language_preference === "en" || data.settings.language_preference === "ja")) {
            setLanguage(data.settings.language_preference);
          }
        }
      } else {
        // If no settings exist, create default settings
        await createDefaultSettings();
      }
    } catch (error) {
      console.error("Error loading user settings:", error);
      // Try to create default settings on error
      await createDefaultSettings();
    } finally {
      setLoading(false);
    }
  }, [setLanguage]);

  const createDefaultSettings = async () => {
    try {
      const response = await fetch("/api/user-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Error creating default settings:", error);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setSuccess(false);
    try {
      const response = await fetch("/api/user-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          languagePreference: settings.language_preference,
          themePreference: settings.theme_preference,
          timezone: settings.timezone,
          profileVisibility: settings.profile_visibility,
          showEmail: settings.show_email,
          showPhone: settings.show_phone,
          allowMessagesFrom: settings.allow_messages_from,
          emailUpdates: settings.email_updates,
          twoFactorEnabled: settings.two_factor_enabled,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        // Update language context
        if (settings.language_preference && (settings.language_preference === "en" || settings.language_preference === "ja")) {
          setLanguage(settings.language_preference);
        }
      }
    } catch (error) {
      console.error("Error saving user settings:", error);
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
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="flex gap-4 border-b" style={{ borderColor: '#E5E7EB' }}>
        <button
          onClick={() => setActiveSection("general")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeSection === "general"
              ? "border-b-2 text-blue-600"
              : "text-gray-600 hover:bg-gray-300"
          }`}
          style={{
            borderBottomColor: activeSection === "general" ? '#2563EB' : 'transparent',
          }}
        >
          {t("settings.sections.general") || "General"}
        </button>
        <button
          onClick={() => setActiveSection("privacy")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeSection === "privacy"
              ? "border-b-2 text-blue-600"
              : "text-gray-600 hover:bg-gray-300"
          }`}
          style={{
            borderBottomColor: activeSection === "privacy" ? '#2563EB' : 'transparent',
          }}
        >
          {t("settings.sections.privacy") || "Privacy"}
        </button>
        <button
          onClick={() => setActiveSection("notifications")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeSection === "notifications"
              ? "border-b-2 text-blue-600"
              : "text-gray-600 hover:bg-gray-300"
          }`}
          style={{
            borderBottomColor: activeSection === "notifications" ? '#2563EB' : 'transparent',
          }}
        >
          {t("settings.sections.notifications") || "Notifications"}
        </button>
      </div>

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {t("profile.settings.saved") || "Settings saved successfully!"}
        </div>
      )}

      {/* General Settings */}
      {activeSection === "general" && (
        <div className="card-gradient p-8 space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {t("settings.general.title") || "General Settings"}
          </h3>

          {/* Language Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.general.language") || "Language"}
            </label>
            <select
              value={settings.language_preference}
              onChange={(e) =>
                setSettings({ ...settings, language_preference: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              style={{ color: '#000000' }}
            >
              <option value="en">English</option>
              <option value="ja">日本語 (Japanese)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {t("settings.general.languageHint") || "Choose your preferred language for the interface"}
            </p>
          </div>

          {/* Theme Preference (for future use) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.general.theme") || "Theme"}
            </label>
            <select
              value={settings.theme_preference}
              onChange={(e) =>
                setSettings({ ...settings, theme_preference: e.target.value })
              }
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark (Coming Soon)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {t("settings.general.themeHint") || "Dark mode coming soon"}
            </p>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.general.timezone") || "Timezone"}
            </label>
            <select
              value={settings.timezone}
              onChange={(e) =>
                setSettings({ ...settings, timezone: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              style={{ color: '#000000' }}
            >
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </div>

          {/* Email Updates */}
          <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                {t("settings.general.emailUpdates") || "Email Updates"}
              </h4>
              <p className="text-sm text-gray-600">
                {t("settings.general.emailUpdatesDesc") || "Receive marketing and announcement emails"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.email_updates}
                onChange={(e) =>
                  setSettings({ ...settings, email_updates: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
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
      )}

      {/* Privacy Settings */}
      {activeSection === "privacy" && (
        <div className="card-gradient p-8 space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {t("settings.privacy.title") || "Privacy Settings"}
          </h3>

          {/* Profile Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.privacy.profileVisibility") || "Profile Visibility"}
            </label>
            <select
              value={settings.profile_visibility}
              onChange={(e) =>
                setSettings({ ...settings, profile_visibility: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              style={{ color: '#000000' }}
            >
              <option value="public">{t("settings.privacy.visibility.public") || "Public"}</option>
              <option value="private">{t("settings.privacy.visibility.private") || "Private"}</option>
              <option value="contacts">{t("settings.privacy.visibility.contacts") || "Contacts Only"}</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {t("settings.privacy.profileVisibilityHint") || "Control who can view your profile"}
            </p>
          </div>

          {/* Allow Messages From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("settings.privacy.allowMessages") || "Allow Messages From"}
            </label>
            <select
              value={settings.allow_messages_from}
              onChange={(e) =>
                setSettings({ ...settings, allow_messages_from: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              style={{ color: '#000000' }}
            >
              <option value="all">{t("settings.privacy.messages.all") || "Everyone"}</option>
              <option value="contacts">{t("settings.privacy.messages.contacts") || "Contacts Only"}</option>
              <option value="none">{t("settings.privacy.messages.none") || "No One"}</option>
            </select>
          </div>

          {/* Show Email */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                {t("settings.privacy.showEmail") || "Show Email Address"}
              </h4>
              <p className="text-sm text-gray-600">
                {t("settings.privacy.showEmailDesc") || "Display your email on your public profile"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.show_email}
                onChange={(e) =>
                  setSettings({ ...settings, show_email: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Show Phone */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                {t("settings.privacy.showPhone") || "Show Phone Number"}
              </h4>
              <p className="text-sm text-gray-600">
                {t("settings.privacy.showPhoneDesc") || "Display your phone number on your public profile"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.show_phone}
                onChange={(e) =>
                  setSettings({ ...settings, show_phone: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
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
      )}

      {/* Notification Settings */}
      {activeSection === "notifications" && (
        <NotificationSettings
          initialSettings={initialNotificationSettings}
          isLoading={externalLoading}
        />
      )}
    </div>
  );
}
