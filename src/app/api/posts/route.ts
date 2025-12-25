import { NextRequest, NextResponse } from "next/server";
import { db, posts, users, postLikes } from "@/db";
import { eq, desc, and } from "drizzle-orm";
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

// GET /api/posts - Get all posts
export async function GET(): Promise<NextResponse<{ posts: PostResponse[] } | { error: string }>> {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId;

    const allPosts = await db
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
      .orderBy(desc(posts.createdAt));

    // Check if current user has liked each post
    const postsWithLikeStatus = await Promise.all(
      allPosts.map(async (post) => {
        let liked = false;
        if (userId) {
          const like = await db.query.postLikes.findFirst({
            where: and(eq(postLikes.userId, userId), eq(postLikes.postId, post.id)),
          });
          liked = !!like;
        }

        // Calculate relative time
        const createdAt = post.createdAt ? new Date(post.createdAt) : new Date();
        const now = new Date();
        const diffMs = now.getTime() - createdAt.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const time = diffHours < 1 ? "now" : diffHours < 24 ? `${diffHours}h` : `${Math.floor(diffHours / 24)}d`;

        return {
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
        };
      })
    );

    return NextResponse.json({ posts: postsWithLikeStatus });
  } catch (error) {
    console.error("Get posts error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// POST /api/posts - Create a new post
export async function POST(
  request: NextRequest
): Promise<NextResponse<{ post: PostResponse } | { error: string }>> {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { content, image } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Get user info
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create post
    const [newPost] = await db
      .insert(posts)
      .values({
        userId: session.userId,
        content: content.trim(),
        image: image || null,
        likes: 0,
        comments: 0,
        reposts: 0,
      })
      .returning();

    return NextResponse.json(
      {
        post: {
          id: newPost.id,
          user: {
            name: user.name,
            username: user.username,
            avatar: user.avatar || "",
            verified: user.verified || false,
          },
          content: newPost.content,
          image: newPost.image || undefined,
          likes: newPost.likes || 0,
          comments: newPost.comments || 0,
          reposts: newPost.reposts || 0,
          time: "now",
          liked: false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
