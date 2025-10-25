import { cookies } from "next/headers";

// Simple in-memory admin credentials (for MVP - would use database in production)
const ADMIN_CREDENTIALS = {
  username: "alexander",
  password: "Bubbelpool-56", // In production, this would be hashed
};

const SESSION_COOKIE_NAME = "garva-admin-session";
const SESSION_SECRET = "garva-secret-key-change-in-production"; // Would be env var in production

export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<boolean> {
  return (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  );
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
  // Simple session token (in production, would use JWT or proper session management)
  const sessionToken = Buffer.from(
    `${SESSION_SECRET}-${Date.now()}`
  ).toString("base64");

  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  return !!session?.value;
}
