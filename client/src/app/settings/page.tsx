import type { Metadata } from "next";
import { SettingsPageClient } from "@/components/SettingsPageClient";

export const metadata: Metadata = {
  title: "Settings - Threadz",
  description: "Manage your Threadz account settings, privacy, and preferences.",
  openGraph: {
    title: "Settings - Threadz",
    description: "Manage your Threadz account settings.",
    type: "website",
  },
};

export default function SettingsPage() {
  return <SettingsPageClient />;
}
