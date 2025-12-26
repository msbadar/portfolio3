"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Icons } from "@/components/ui/Icons";
import { AppProvider, useApp } from "@/context/AppContext";
import { AvatarMenu } from "@/components/AvatarMenu";
import { ToastContainer } from "@/components/ui/Toast";

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection = ({ title, children }: SettingsSectionProps) => (
  <div className="bg-[var(--surface)] rounded-2xl p-6 shadow-card">
    <h2 className="text-lg font-semibold mb-4 text-[var(--foreground)]">{title}</h2>
    <div className="space-y-4">{children}</div>
  </div>
);

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  action?: React.ReactNode;
  onClick?: () => void;
}

const SettingsItem = ({ icon, label, description, action, onClick }: SettingsItemProps) => (
  <div
    className={`flex items-center gap-4 p-3 rounded-xl ${onClick ? "hover:bg-[var(--surface-hover)] cursor-pointer" : ""} transition-colors`}
    onClick={onClick}
  >
    <div className="w-10 h-10 bg-[var(--background)] rounded-xl flex items-center justify-center text-[var(--muted)]">
      {icon}
    </div>
    <div className="flex-1">
      <span className="font-medium text-[var(--foreground)]">{label}</span>
      {description && (
        <p className="text-sm text-[var(--muted)]">{description}</p>
      )}
    </div>
    {action}
  </div>
);

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
}

const ToggleSwitch = ({ enabled, onToggle }: ToggleSwitchProps) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onToggle();
    }}
    className={`w-12 h-7 rounded-full transition-colors relative ${
      enabled ? "bg-[var(--accent)]" : "bg-[var(--border)]"
    }`}
  >
    <span
      className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
        enabled ? "left-6" : "left-1"
      }`}
    />
  </button>
);

const SettingsContent = () => {
  const { showToast } = useApp();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    privateAccount: false,
    twoFactorAuth: false,
    darkMode: true,
    reducedMotion: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    showToast("Setting updated", "success");
  };

  return (
    <>
      <AvatarMenu />
      <main className="flex-1 min-w-0 bg-[var(--background)] overflow-y-auto">
        <div className="max-w-2xl mx-auto p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/profile"
              className="p-2 rounded-xl text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)] transition-all"
            >
              {Icons.back()}
            </Link>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
          </div>

          <div className="space-y-6">
            {/* Account Section */}
            <SettingsSection title="Account">
              <SettingsItem
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                label="Edit Profile"
                description="Update your profile information"
                onClick={() => showToast("Opening profile editor...", "info")}
                action={<span className="text-[var(--muted)]">→</span>}
              />
              <SettingsItem
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                label="Change Password"
                description="Update your account password"
                onClick={() => showToast("Password change feature coming soon", "info")}
                action={<span className="text-[var(--muted)]">→</span>}
              />
              <SettingsItem
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
                label="Email Address"
                description="user@example.com"
                onClick={() => showToast("Email change feature coming soon", "info")}
                action={<span className="text-[var(--muted)]">→</span>}
              />
            </SettingsSection>

            {/* Privacy & Security Section */}
            <SettingsSection title="Privacy & Security">
              <SettingsItem
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                label="Private Account"
                description="Only approved followers can see your posts"
                action={
                  <ToggleSwitch
                    enabled={settings.privateAccount}
                    onToggle={() => toggleSetting("privateAccount")}
                  />
                }
              />
              <SettingsItem
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
                label="Two-Factor Authentication"
                description="Add an extra layer of security"
                action={
                  <ToggleSwitch
                    enabled={settings.twoFactorAuth}
                    onToggle={() => toggleSetting("twoFactorAuth")}
                  />
                }
              />
            </SettingsSection>

            {/* Notifications Section */}
            <SettingsSection title="Notifications">
              <SettingsItem
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
                label="Email Notifications"
                description="Receive email updates about activity"
                action={
                  <ToggleSwitch
                    enabled={settings.emailNotifications}
                    onToggle={() => toggleSetting("emailNotifications")}
                  />
                }
              />
              <SettingsItem
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
                label="Push Notifications"
                description="Receive push notifications on your device"
                action={
                  <ToggleSwitch
                    enabled={settings.pushNotifications}
                    onToggle={() => toggleSetting("pushNotifications")}
                  />
                }
              />
            </SettingsSection>

            {/* Appearance Section */}
            <SettingsSection title="Appearance">
              <SettingsItem
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
                label="Dark Mode"
                description="Use dark theme"
                action={
                  <ToggleSwitch
                    enabled={settings.darkMode}
                    onToggle={() => toggleSetting("darkMode")}
                  />
                }
              />
              <SettingsItem
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}
                label="Reduced Motion"
                description="Reduce animations and motion effects"
                action={
                  <ToggleSwitch
                    enabled={settings.reducedMotion}
                    onToggle={() => toggleSetting("reducedMotion")}
                  />
                }
              />
            </SettingsSection>

            {/* Quick Links */}
            <SettingsSection title="More">
              <Link href="/preferences">
                <SettingsItem
                  icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>}
                  label="Preferences"
                  description="Customize your experience"
                  action={<span className="text-[var(--muted)]">→</span>}
                />
              </Link>
              <Link href="/insights">
                <SettingsItem
                  icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}
                  label="Insights"
                  description="View your stats and analytics"
                  action={<span className="text-[var(--muted)]">→</span>}
                />
              </Link>
            </SettingsSection>

            {/* Danger Zone */}
            <div className="bg-red-500/10 rounded-2xl p-6 border border-red-500/20">
              <h2 className="text-lg font-semibold mb-4 text-red-500">Danger Zone</h2>
              <SettingsItem
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>}
                label="Delete Account"
                description="Permanently delete your account and all data"
                onClick={() => showToast("Account deletion is disabled", "error")}
                action={<span className="text-red-500">→</span>}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

const ToastContainerWithContext = () => {
  const { ui, dispatchUI } = useApp();
  return (
    <ToastContainer
      toasts={ui.toasts}
      onRemove={(id) => dispatchUI({ type: "REMOVE_TOAST", payload: id })}
    />
  );
};

export const SettingsPageClient = () => {
  return (
    <AppProvider>
      <div className="flex min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)]">
        <SettingsContent />
        <ToastContainerWithContext />
      </div>
    </AppProvider>
  );
};
