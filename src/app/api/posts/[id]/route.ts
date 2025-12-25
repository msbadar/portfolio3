import { NextRequest, NextResponse } from "next/server";
import { db, posts, users, postLikes } from "@/db";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

interface PostResponse {
  id: number;
  user: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  reposts: number;
  time: string;
  liked: boolean;
}

// GET /api/posts/[id] - Get a single post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ post: PostResponse } | { error: string }>> {
  try {
    const { id } = await params;
    const postId = parseInt(id);
    
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const session = await getCurrentUser();
    const userId = session?.userId;

    const [post] = await db
      .select({
        id: posts.id,
        content: posts.content,
        image: posts.image,
        likes: posts.likes,
        comments: posts.comments,
        reposts: posts.reposts,
        createdAt: posts.createdAt,
        userName: users.name,
        userUsername: users.username,
        userAvatar: users.avatar,
        userVerified: users.verified,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, postId));

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    let liked = false;
    if (userId) {
      const like = await db.query.postLikes.findFirst({
        where: and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)),
      });
      liked = !!like;
    }

    // Calculate relative time
    const createdAt = post.createdAt ? new Date(post.createdAt) : new Date();
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const time = diffHours < 1 ? "now" : diffHours < 24 ? `${diffHours}h` : `${Math.floor(diffHours / 24)}d`;

    return NextResponse.json({
      post: {
        id: post.id,
        user: {
          name: post.userName || "Anonymous",
          username: post.userUsername || "anonymous",
          avatar: post.userAvatar || "",
          verified: post.userVerified || false,
        },
        content: post.content,
        image: post.image || undefined,
        likes: post.likes || 0,
        comments: post.comments || 0,
        reposts: post.reposts || 0,
        time,
        liked,
      },
    });
  } catch (error) {
    console.error("Get post error:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

// PUT /api/posts/[id] - Update a post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ post: { id: number; content: string } } | { error: string }>> {
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

    // Check if post exists and belongs to user
    const existingPost = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost.userId !== session.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const [updatedPost] = await db
      .update(posts)
      .set({ content: content.trim(), updatedAt: new Date() })
      .where(eq(posts.id, postId))
      .returning();

    return NextResponse.json({
      post: { id: updatedPost.id, content: updatedPost.content },
    });
  } catch (error) {
    console.error("Update post error:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

// DELETE /api/posts/[id] - Delete a post
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
    const postId = parseInt(id);
    
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    // Check if post exists and belongs to user
    const existingPost = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost.userId !== session.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await db.delete(posts).where(eq(posts.id, postId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
