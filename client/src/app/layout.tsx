import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { serverApi } from "@/lib/server-api";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const apiMetadata = await serverApi.metadata.get();

  // Fallback metadata in case API request fails
  const fallbackMetadata: Metadata = {
    title: {
      default: "Threadz - Social Platform",
      template: "%s | Threadz",
    },
    description:
      "A modern social platform for sharing threads and blogs. Connect with others and share your thoughts.",
    keywords: ["social platform", "threads", "blogs", "community", "share"],
    authors: [{ name: "Threadz Team" }],
    creator: "Threadz",
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "https://threadz.app",
      siteName: "Threadz",
      title: "Threadz - Social Platform",
      description: "A modern social platform for sharing threads and blogs",
    },
    twitter: {
      card: "summary_large_image",
      title: "Threadz - Social Platform",
      description: "A modern social platform for sharing threads and blogs",
    },
    robots: {
      index: true,
      follow: true,
    },
  };

  if (!apiMetadata) {
    return fallbackMetadata;
  }

  return {
    title: {
      default: apiMetadata.title,
      template: apiMetadata.titleTemplate,
    },
    description: apiMetadata.description,
    keywords: apiMetadata.keywords,
    authors: apiMetadata.authors,
    creator: apiMetadata.creator,
    openGraph: {
      type: apiMetadata.openGraph.type as "website" | "article",
      locale: apiMetadata.openGraph.locale,
      url: apiMetadata.openGraph.url,
      siteName: apiMetadata.openGraph.siteName,
      title: apiMetadata.openGraph.title,
      description: apiMetadata.openGraph.description,
    },
    twitter: {
      card: apiMetadata.twitter.card as "summary" | "summary_large_image" | "app" | "player",
      title: apiMetadata.twitter.title,
      description: apiMetadata.twitter.description,
    },
    robots: {
      index: apiMetadata.robots.index,
      follow: apiMetadata.robots.follow,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
