import { NextResponse } from "next/server";
import { db, users, userFollows } from "@/db";
import { ne, notInArray, eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

interface SuggestionResponse {
  id: number;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  followers: string;
}

// GET /api/users/suggestions - Get user suggestions (users to follow)
export async function GET(): Promise<NextResponse<{ suggestions: SuggestionResponse[] } | { error: string }>> {
  try {
    const session = await getCurrentUser();
    const userId = session?.userId;

    // Get users that the current user is not already following
    let excludeIds: number[] = [];
    
    if (userId) {
      const followedUsers = await db
        .select({ followingId: userFollows.followingId })
        .from(userFollows)
        .where(eq(userFollows.followerId, userId));
      
      excludeIds = [userId, ...followedUsers.map(f => f.followingId)];
    }

    const suggestedUsers = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        avatar: users.avatar,
        verified: users.verified,
        followers: users.followers,
      })
      .from(users)
      .where(excludeIds.length > 0 ? notInArray(users.id, excludeIds) : ne(users.id, 0))
      .orderBy(desc(users.followers))
      .limit(5);

    const suggestions: SuggestionResponse[] = suggestedUsers.map(user => ({
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar || "",
      verified: user.verified || false,
      followers: formatFollowers(user.followers || 0),
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Get suggestions error:", error);
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 });
  }
}

// Helper to format follower count
function formatFollowers(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}
