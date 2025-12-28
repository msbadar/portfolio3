import type { Metadata } from "next";
import { DashboardPageClient } from "@/components/DashboardPageClient";

export const metadata: Metadata = {
  title: "Dashboard - Threadz",
  description: "Manage your domain and blog presentation from one place.",
  openGraph: {
    title: "Dashboard - Threadz",
    description: "Manage your domain and blog presentation.",
    type: "website",
  },
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}
