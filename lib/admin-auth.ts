import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  createSessionToken,
  verifySessionToken,
} from "@/lib/admin-session";

export { verifyAdminPassword } from "@/lib/admin-session";

export async function isAdminAuthenticated(): Promise<boolean> {
  const { env } = getCloudflareContext();
  const store = await cookies();
  return verifySessionToken(
    store.get(ADMIN_SESSION_COOKIE)?.value,
    env.ADMIN_PASSWORD,
  );
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Unauthorized");
  }
}

export async function setAdminSessionCookie(): Promise<void> {
  const { env } = getCloudflareContext();
  const token = await createSessionToken(env.ADMIN_PASSWORD);
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
}
