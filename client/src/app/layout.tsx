import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Threadz - Social Platform",
    template: "%s | Threadz",
  },
  description: "A modern social platform for sharing threads and blogs. Connect with others and share your thoughts.",
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
