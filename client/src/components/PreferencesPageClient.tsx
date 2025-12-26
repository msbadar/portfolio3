"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Icons } from "@/components/ui/Icons";
import { AppProvider, useApp } from "@/context/AppContext";
import { AvatarMenu } from "@/components/AvatarMenu";
import { ToastContainer } from "@/components/ui/Toast";

interface PreferenceSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const PreferenceSection = ({ title, description, children }: PreferenceSectionProps) => (
  <div className="bg-[var(--surface)] rounded-2xl p-6 shadow-card">
    <h2 className="text-lg font-semibold mb-1 text-[var(--foreground)]">{title}</h2>
    {description && <p className="text-sm text-[var(--muted)] mb-4">{description}</p>}
    {!description && <div className="mb-4" />}
    {children}
  </div>
);

interface RadioOptionProps {
  name: string;
  value: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: string) => void;
}

const RadioOption = ({ name, value, label, description, checked, onChange }: RadioOptionProps) => (
  <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${checked ? "bg-[var(--accent)]/10 border border-[var(--accent)]/30" : "hover:bg-[var(--surface-hover)] border border-transparent"}`}>
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={() => onChange(value)}
      className="w-4 h-4 mt-1 accent-[var(--accent)]"
    />
    <div>
      <span className="font-medium text-[var(--foreground)]">{label}</span>
      {description && <p className="text-sm text-[var(--muted)]">{description}</p>}
    </div>
  </label>
);

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
}

const ToggleSwitch = ({ enabled, onToggle }: ToggleSwitchProps) => (
  <button
    onClick={onToggle}
    className={`w-12 h-7 rounded-full transition-colors relative ${enabled ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
  >
    <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${enabled ? "left-6" : "left-1"}`} />
  </button>
);

interface PreferenceRowProps {
  label: string;
  description?: string;
  action: React.ReactNode;
}

const PreferenceRow = ({ label, description, action }: PreferenceRowProps) => (
  <div className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
    <div>
      <span className="font-medium text-[var(--foreground)]">{label}</span>
      {description && <p className="text-sm text-[var(--muted)]">{description}</p>}
    </div>
    {action}
  </div>
);

const PreferencesContent = () => {
  const { showToast } = useApp();
  const [preferences, setPreferences] = useState({
    // Theme
    theme: "dark",
    // Content
    defaultFeedSort: "recent",
    showSensitiveContent: false,
    autoPlayVideos: true,
    highQualityImages: true,
    // Accessibility
    fontSize: "medium",
    reduceMotion: false,
    highContrast: false,
    // Language
    language: "en",
    // Content Preferences
    showRecommendations: true,
    showTrending: true,
    showWhoToFollow: true,
    // Privacy
    allowTagging: true,
    allowDMs: "everyone",
  });

  const updatePreference = <K extends keyof typeof preferences>(key: K, value: typeof preferences[K]) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    showToast("Preference updated", "success");
  };

  return (
    <>
      <AvatarMenu />
      <main className="flex-1 min-w-0 bg-[var(--background)] overflow-y-auto">
        <div className="max-w-2xl mx-auto p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/settings"
              className="p-2 rounded-xl text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)] transition-all"
            >
              {Icons.back()}
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">Preferences</h1>
              <p className="text-sm text-[var(--muted)]">Customize your Threadz experience</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Theme */}
            <PreferenceSection title="Theme" description="Choose how Threadz looks to you">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <RadioOption
                  name="theme"
                  value="light"
                  label="Light"
                  checked={preferences.theme === "light"}
                  onChange={(v) => updatePreference("theme", v)}
                />
                <RadioOption
                  name="theme"
                  value="dark"
                  label="Dark"
                  checked={preferences.theme === "dark"}
                  onChange={(v) => updatePreference("theme", v)}
                />
                <RadioOption
                  name="theme"
                  value="system"
                  label="System"
                  checked={preferences.theme === "system"}
                  onChange={(v) => updatePreference("theme", v)}
                />
              </div>
            </PreferenceSection>

            {/* Font Size */}
            <PreferenceSection title="Font Size" description="Adjust the text size throughout the app">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <RadioOption
                  name="fontSize"
                  value="small"
                  label="Small"
                  checked={preferences.fontSize === "small"}
                  onChange={(v) => updatePreference("fontSize", v)}
                />
                <RadioOption
                  name="fontSize"
                  value="medium"
                  label="Medium"
                  checked={preferences.fontSize === "medium"}
                  onChange={(v) => updatePreference("fontSize", v)}
                />
                <RadioOption
                  name="fontSize"
                  value="large"
                  label="Large"
                  checked={preferences.fontSize === "large"}
                  onChange={(v) => updatePreference("fontSize", v)}
                />
              </div>
            </PreferenceSection>

            {/* Feed Preferences */}
            <PreferenceSection title="Feed Preferences" description="Control what appears in your feed">
              <div className="space-y-1">
                <PreferenceRow
                  label="Default Feed Sort"
                  description="How posts are ordered in your feed"
                  action={
                    <select
                      value={preferences.defaultFeedSort}
                      onChange={(e) => updatePreference("defaultFeedSort", e.target.value)}
                      className="px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="popular">Most Popular</option>
                      <option value="recommended">Recommended</option>
                    </select>
                  }
                />
                <PreferenceRow
                  label="Show Recommendations"
                  description="Display recommended posts in your feed"
                  action={
                    <ToggleSwitch
                      enabled={preferences.showRecommendations}
                      onToggle={() => updatePreference("showRecommendations", !preferences.showRecommendations)}
                    />
                  }
                />
                <PreferenceRow
                  label="Show Trending Topics"
                  description="Display trending topics in sidebar"
                  action={
                    <ToggleSwitch
                      enabled={preferences.showTrending}
                      onToggle={() => updatePreference("showTrending", !preferences.showTrending)}
                    />
                  }
                />
                <PreferenceRow
                  label="Show Who to Follow"
                  description="Display follow suggestions in sidebar"
                  action={
                    <ToggleSwitch
                      enabled={preferences.showWhoToFollow}
                      onToggle={() => updatePreference("showWhoToFollow", !preferences.showWhoToFollow)}
                    />
                  }
                />
              </div>
            </PreferenceSection>

            {/* Media */}
            <PreferenceSection title="Media" description="Control media playback and quality">
              <div className="space-y-1">
                <PreferenceRow
                  label="Auto-play Videos"
                  description="Automatically play videos in feed"
                  action={
                    <ToggleSwitch
                      enabled={preferences.autoPlayVideos}
                      onToggle={() => updatePreference("autoPlayVideos", !preferences.autoPlayVideos)}
                    />
                  }
                />
                <PreferenceRow
                  label="High Quality Images"
                  description="Load images in highest quality (uses more data)"
                  action={
                    <ToggleSwitch
                      enabled={preferences.highQualityImages}
                      onToggle={() => updatePreference("highQualityImages", !preferences.highQualityImages)}
                    />
                  }
                />
              </div>
            </PreferenceSection>

            {/* Accessibility */}
            <PreferenceSection title="Accessibility" description="Make Threadz easier to use">
              <div className="space-y-1">
                <PreferenceRow
                  label="Reduce Motion"
                  description="Minimize animations throughout the app"
                  action={
                    <ToggleSwitch
                      enabled={preferences.reduceMotion}
                      onToggle={() => updatePreference("reduceMotion", !preferences.reduceMotion)}
                    />
                  }
                />
                <PreferenceRow
                  label="High Contrast"
                  description="Increase color contrast for better visibility"
                  action={
                    <ToggleSwitch
                      enabled={preferences.highContrast}
                      onToggle={() => updatePreference("highContrast", !preferences.highContrast)}
                    />
                  }
                />
              </div>
            </PreferenceSection>

            {/* Privacy */}
            <PreferenceSection title="Privacy" description="Control who can interact with you">
              <div className="space-y-1">
                <PreferenceRow
                  label="Allow Tagging"
                  description="Let others tag you in their posts"
                  action={
                    <ToggleSwitch
                      enabled={preferences.allowTagging}
                      onToggle={() => updatePreference("allowTagging", !preferences.allowTagging)}
                    />
                  }
                />
                <PreferenceRow
                  label="Direct Messages"
                  description="Who can send you direct messages"
                  action={
                    <select
                      value={preferences.allowDMs}
                      onChange={(e) => updatePreference("allowDMs", e.target.value)}
                      className="px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                    >
                      <option value="everyone">Everyone</option>
                      <option value="followers">Followers Only</option>
                      <option value="nobody">Nobody</option>
                    </select>
                  }
                />
              </div>
            </PreferenceSection>

            {/* Language */}
            <PreferenceSection title="Language" description="Choose your preferred language">
              <select
                value={preferences.language}
                onChange={(e) => updatePreference("language", e.target.value)}
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="pt">Português</option>
                <option value="ja">日本語</option>
                <option value="zh">中文</option>
                <option value="ko">한국어</option>
              </select>
            </PreferenceSection>

            {/* Content */}
            <PreferenceSection title="Content" description="Control content visibility">
              <PreferenceRow
                label="Show Sensitive Content"
                description="Display content that may be sensitive"
                action={
                  <ToggleSwitch
                    enabled={preferences.showSensitiveContent}
                    onToggle={() => updatePreference("showSensitiveContent", !preferences.showSensitiveContent)}
                  />
                }
              />
            </PreferenceSection>
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

export const PreferencesPageClient = () => {
  return (
    <AppProvider>
      <div className="flex min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)]">
        <PreferencesContent />
        <ToastContainerWithContext />
      </div>
    </AppProvider>
  );
};
