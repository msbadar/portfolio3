import { NextRequest, NextResponse } from "next/server";
import { db, blogs, blogLikes } from "@/db";
import { eq, and, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

// POST /api/blogs/[id]/like - Toggle like on a blog
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ liked: boolean; likes: number } | { error: string }>> {
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

    // Check if blog exists
    const blog = await db.query.blogs.findFirst({
      where: eq(blogs.id, blogId),
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Check if already liked
    const existingLike = await db.query.blogLikes.findFirst({
      where: and(eq(blogLikes.userId, session.userId), eq(blogLikes.blogId, blogId)),
    });

    let liked: boolean;
    let newLikesCount: number;

    if (existingLike) {
      // Unlike
      await db.delete(blogLikes).where(eq(blogLikes.id, existingLike.id));
      const [updatedBlog] = await db
        .update(blogs)
        .set({ likes: sql`${blogs.likes} - 1` })
        .where(eq(blogs.id, blogId))
        .returning();
      liked = false;
      newLikesCount = updatedBlog.likes || 0;
    } else {
      // Like
      await db.insert(blogLikes).values({
        userId: session.userId,
        blogId: blogId,
      });
      const [updatedBlog] = await db
        .update(blogs)
        .set({ likes: sql`${blogs.likes} + 1` })
        .where(eq(blogs.id, blogId))
        .returning();
      liked = true;
      newLikesCount = updatedBlog.likes || 0;
    }

    return NextResponse.json({ liked, likes: newLikesCount });
  } catch (error) {
    console.error("Toggle blog like error:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
