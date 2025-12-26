import type { Metadata } from "next";
import { SearchPageClient } from "@/components/SearchPageClient";

export const metadata: Metadata = {
  title: "Search - Threadz",
  description: "Search for threads, blogs, and users on Threadz. Find the content you're looking for.",
  openGraph: {
    title: "Search - Threadz",
    description: "Search for threads, blogs, and users on Threadz.",
    type: "website",
  },
};

export default function SearchPage() {
  return <SearchPageClient />;
}
