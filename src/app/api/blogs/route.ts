import { NextRequest, NextResponse } from "next/server";
import { db, blogs, blogLikes } from "@/db";
import { eq, desc, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

interface BlogResponse {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  readTime: string;
  date: string;
  likes: number;
  comments: number;
  category: string;
  liked: boolean;
}

// GET /api/blogs - Get all blogs
export async function GET(): Promise<NextResponse<{ blogs: BlogResponse[] } | { error: string }>> {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId;

    const allBlogs = await db
      .select()
      .from(blogs)
      .orderBy(desc(blogs.createdAt));

    // Check if current user has liked each blog
    const blogsWithLikeStatus = await Promise.all(
      allBlogs.map(async (blog) => {
        let liked = false;
        if (userId) {
          const like = await db.query.blogLikes.findFirst({
            where: and(eq(blogLikes.userId, userId), eq(blogLikes.blogId, blog.id)),
          });
          liked = !!like;
        }

        // Format date
        const createdAt = blog.createdAt ? new Date(blog.createdAt) : new Date();
        const date = createdAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        return {
          id: blog.id,
          title: blog.title,
          excerpt: blog.excerpt || "",
          content: blog.content,
          coverImage: blog.coverImage || "",
          readTime: blog.readTime || "5 min read",
          date,
          likes: blog.likes || 0,
          comments: blog.comments || 0,
          category: blog.category || "General",
          liked,
        };
      })
    );

    return NextResponse.json({ blogs: blogsWithLikeStatus });
  } catch (error) {
    console.error("Get blogs error:", error);
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}

// POST /api/blogs - Create a new blog
export async function POST(
  request: NextRequest
): Promise<NextResponse<{ blog: BlogResponse } | { error: string }>> {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { title, excerpt, content, coverImage, category } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    // Calculate read time (roughly 200 words per minute)
    const wordCount = content.trim().split(/\s+/).length;
    const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

    // Create blog
    const [newBlog] = await db
      .insert(blogs)
      .values({
        userId: session.userId,
        title: title.trim(),
        excerpt: excerpt?.trim() || "",
        content: content.trim(),
        coverImage: coverImage || null,
        readTime,
        category: category || "General",
        likes: 0,
        comments: 0,
      })
      .returning();

    const date = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return NextResponse.json(
      {
        blog: {
          id: newBlog.id,
          title: newBlog.title,
          excerpt: newBlog.excerpt || "",
          content: newBlog.content,
          coverImage: newBlog.coverImage || "",
          readTime: newBlog.readTime || "5 min read",
          date,
          likes: newBlog.likes || 0,
          comments: newBlog.comments || 0,
          category: newBlog.category || "General",
          liked: false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create blog error:", error);
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 });
  }
}
