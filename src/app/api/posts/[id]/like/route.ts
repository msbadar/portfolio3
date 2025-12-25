import { NextRequest, NextResponse } from "next/server";
import { db, posts, postLikes } from "@/db";
import { eq, and, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

// POST /api/posts/[id]/like - Toggle like on a post
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
    const postId = parseInt(id);
    
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    // Check if post exists
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if already liked
    const existingLike = await db.query.postLikes.findFirst({
      where: and(eq(postLikes.userId, session.userId), eq(postLikes.postId, postId)),
    });

    let liked: boolean;
    let newLikesCount: number;

    if (existingLike) {
      // Unlike
      await db.delete(postLikes).where(eq(postLikes.id, existingLike.id));
      const [updatedPost] = await db
        .update(posts)
        .set({ likes: sql`${posts.likes} - 1` })
        .where(eq(posts.id, postId))
        .returning();
      liked = false;
      newLikesCount = updatedPost.likes || 0;
    } else {
      // Like
      await db.insert(postLikes).values({
        userId: session.userId,
        postId: postId,
      });
      const [updatedPost] = await db
        .update(posts)
        .set({ likes: sql`${posts.likes} + 1` })
        .where(eq(posts.id, postId))
        .returning();
      liked = true;
      newLikesCount = updatedPost.likes || 0;
    }

    return NextResponse.json({ liked, likes: newLikesCount });
  } catch (error) {
    console.error("Toggle like error:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
