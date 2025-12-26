import type { Metadata } from "next";
import { BlogsPageClient } from "@/components/BlogsPageClient";

export const metadata: Metadata = {
  title: "Blogs - Threadz",
  description: "Discover insightful articles on design, development, productivity, and more. Read the latest posts from our community.",
  openGraph: {
    title: "Blogs - Threadz",
    description: "Discover insightful articles on design, development, productivity, and more.",
    type: "website",
  },
};

export default function BlogsPage() {
  return <BlogsPageClient />;
}
