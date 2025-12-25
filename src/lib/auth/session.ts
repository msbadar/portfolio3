import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { JWTPayload, AuthUser } from "./types";

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Gets the JWT secret for token signing/verification.
 * In production, JWT_SECRET environment variable is required.
 * In development, a fallback secret is used.
 */
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  // Use fallback only in development
  return new TextEncoder().encode(secret || "dev-secret-key-min-32-chars-long!");
}

export async function createToken(userId: number, email: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + Math.floor(SESSION_DURATION / 1000);

  const token = await new SignJWT({ userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(getJwtSecret());

  return token;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000, // in seconds
    path: "/",
  });
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("auth-token")?.value;
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = await getAuthCookie();
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Formats a database user record for API responses.
 * Handles null values by providing sensible defaults.
 * 
 * @param dbUser - The user record from the database with potentially null fields
 * @returns A formatted AuthUser object safe for API responses
 */
export function formatAuthUser(dbUser: {
  id: number;
  email: string;
  name: string;
  username: string;
  avatar: string | null;
  verified: boolean | null;
  bio: string | null;
  followers: number | null;
  following: number | null;
  link: string | null;
}): AuthUser {
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    username: dbUser.username,
    avatar: dbUser.avatar,
    verified: dbUser.verified || false,
    bio: dbUser.bio,
    followers: dbUser.followers || 0,
    following: dbUser.following || 0,
    link: dbUser.link,
  };
}
