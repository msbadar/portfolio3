import type { Metadata } from "next";
import { AppProvider } from "@/context/AppContext";
import { AppContent } from "@/components/AppContent";
import { AboutPageClient } from "@/components/AboutPageClient";

export const metadata: Metadata = {
  title: "About - Threadz",
  description: "Learn more about this profile and their work.",
  openGraph: {
    title: "About - Threadz",
    description: "Learn more about this profile.",
    type: "profile",
  },
};

export default function AboutPage() {
  return (
    <AppProvider>
      <AppContent>
        <AboutPageClient />
      </AppContent>
    </AppProvider>
  );
}
