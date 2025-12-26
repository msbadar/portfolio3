import type { Metadata } from "next";
import { PreferencesPageClient } from "@/components/PreferencesPageClient";

export const metadata: Metadata = {
  title: "Preferences - Threadz",
  description: "Customize your Threadz experience with personalized preferences.",
  openGraph: {
    title: "Preferences - Threadz",
    description: "Customize your Threadz experience.",
    type: "website",
  },
};

export default function PreferencesPage() {
  return <PreferencesPageClient />;
}
