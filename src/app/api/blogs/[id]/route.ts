import { NextRequest, NextResponse } from "next/server";
import { db, blogs, blogLikes } from "@/db";
import { eq, and } from "drizzle-orm";
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

// GET /api/blogs/[id] - Get a single blog
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ blog: BlogResponse } | { error: string }>> {
  try {
    const { id } = await params;
    const blogId = parseInt(id);
    
    if (isNaN(blogId)) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
    }

    const session = await getCurrentUser();
    const userId = session?.userId;

    const blog = await db.query.blogs.findFirst({
      where: eq(blogs.id, blogId),
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    let liked = false;
    if (userId) {
      const like = await db.query.blogLikes.findFirst({
        where: and(eq(blogLikes.userId, userId), eq(blogLikes.blogId, blogId)),
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

    return NextResponse.json({
      blog: {
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
      },
    });
  } catch (error) {
    console.error("Get blog error:", error);
    return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 });
  }
}

// PUT /api/blogs/[id] - Update a blog
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ blog: BlogResponse } | { error: string }>> {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const blogId = parseInt(id);
    
    if (isNaN(blogId)) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
    }

    // Check if blog exists and belongs to user
    const existingBlog = await db.query.blogs.findFirst({
      where: eq(blogs.id, blogId),
    });

    if (!existingBlog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    if (existingBlog.userId !== session.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();
    const { title, excerpt, content, coverImage, category } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    // Calculate read time
    const wordCount = content.trim().split(/\s+/).length;
    const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

    const [updatedBlog] = await db
      .update(blogs)
      .set({
        title: title.trim(),
        excerpt: excerpt?.trim() || "",
        content: content.trim(),
        coverImage: coverImage || null,
        category: category || "General",
        readTime,
        updatedAt: new Date(),
      })
      .where(eq(blogs.id, blogId))
      .returning();

    const date = (updatedBlog.createdAt || new Date()).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return NextResponse.json({
      blog: {
        id: updatedBlog.id,
        title: updatedBlog.title,
        excerpt: updatedBlog.excerpt || "",
        content: updatedBlog.content,
        coverImage: updatedBlog.coverImage || "",
        readTime: updatedBlog.readTime || "5 min read",
        date,
        likes: updatedBlog.likes || 0,
        comments: updatedBlog.comments || 0,
        category: updatedBlog.category || "General",
        liked: false,
      },
    });
  } catch (error) {
    console.error("Update blog error:", error);
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 });
  }
}

// DELETE /api/blogs/[id] - Delete a blog
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const blogId = parseInt(id);
    
    if (isNaN(blogId)) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
    }

    // Check if blog exists and belongs to user
    const existingBlog = await db.query.blogs.findFirst({
      where: eq(blogs.id, blogId),
    });

    if (!existingBlog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    if (existingBlog.userId !== session.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await db.delete(blogs).where(eq(blogs.id, blogId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete blog error:", error);
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 });
  }
}
