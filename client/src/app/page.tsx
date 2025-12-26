import { AppProvider } from "@/context/AppContext";
import { AppContent } from "@/components/AppContent";
import { serverApi } from "@/lib/server-api";

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Server Component - fetches posts on the server
export default async function App({ searchParams }: HomeProps) {
  // Await searchParams (Next.js 15+ requirement)
  const params = await searchParams;

  // Extract filters from URL search params
  const filters = {
    type: (params.type as "post" | "blog") || undefined,
    category: params.category as string | undefined,
    search: params.search as string | undefined,
  };

  // Fetch posts on the server for initial load with filters
  const initialPosts = await serverApi.posts.getAll(filters);

  return (
    <AppProvider initialPosts={initialPosts}>
      <AppContent />
    </AppProvider>
  );
}
