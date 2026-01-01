import type { Metadata } from "next";
import { InsightsPageClient } from "@/components/InsightsPageClient";

export const metadata: Metadata = {
  title: "Insights - Threadz",
  description: "View your Threadz stats, analytics, and engagement metrics.",
  openGraph: {
    title: "Insights - Threadz",
    description: "View your Threadz analytics and engagement.",
    type: "website",
  },
};

export default function InsightsPage() {
  return <InsightsPageClient />;
}
