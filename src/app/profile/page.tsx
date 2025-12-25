import type { Metadata } from "next";
import { ProfilePageClient } from "@/components/ProfilePageClient";

export const metadata: Metadata = {
  title: "Profile - Threadz",
  description: "View and manage your Threadz profile. See your threads, blogs, and activity.",
  openGraph: {
    title: "Profile - Threadz",
    description: "View and manage your Threadz profile.",
    type: "profile",
  },
};

export default function ProfilePage() {
  return <ProfilePageClient />;
}
