import { NextRequest, NextResponse } from "next/server";
import { db, users, userFollows } from "@/db";
import { eq, and, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

// POST /api/users/[id]/follow - Toggle follow on a user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ following: boolean } | { error: string }>> {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const targetUserId = parseInt(id);
    
    if (isNaN(targetUserId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Can't follow yourself
    if (targetUserId === session.userId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    // Check if target user exists
    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, targetUserId),
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already following
    const existingFollow = await db.query.userFollows.findFirst({
      where: and(
        eq(userFollows.followerId, session.userId),
        eq(userFollows.followingId, targetUserId)
      ),
    });

    let following: boolean;

    if (existingFollow) {
      // Unfollow
      await db.delete(userFollows).where(eq(userFollows.id, existingFollow.id));
      
      // Update follower/following counts
      await db
        .update(users)
        .set({ following: sql`${users.following} - 1` })
        .where(eq(users.id, session.userId));
      await db
        .update(users)
        .set({ followers: sql`${users.followers} - 1` })
        .where(eq(users.id, targetUserId));
      
      following = false;
    } else {
      // Follow
      await db.insert(userFollows).values({
        followerId: session.userId,
        followingId: targetUserId,
      });
      
      // Update follower/following counts
      await db
        .update(users)
        .set({ following: sql`${users.following} + 1` })
        .where(eq(users.id, session.userId));
      await db
        .update(users)
        .set({ followers: sql`${users.followers} + 1` })
        .where(eq(users.id, targetUserId));
      
      following = true;
    }

    return NextResponse.json({ following });
  } catch (error) {
    console.error("Toggle follow error:", error);
    return NextResponse.json({ error: "Failed to toggle follow" }, { status: 500 });
  }
}
