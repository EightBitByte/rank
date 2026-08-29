"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { setAdminSessionCookie, verifyAdminPassword } from "@/lib/admin-auth";

export type LoginState = { error: string | null };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const { env } = getCloudflareContext();
  const headerStore = await headers();
  const ip = headerStore.get("CF-Connecting-IP") ?? "unknown";

  const { success } = await env.LOGIN_LIMITER.limit({ key: ip });
  if (!success) {
    return { error: "Too many attempts. Try again in a minute." };
  }

  const password = String(formData.get("password") ?? "");
  const valid = await verifyAdminPassword(password, env.ADMIN_PASSWORD);
  if (!valid) {
    return { error: "Incorrect password." };
  }

  await setAdminSessionCookie();
  redirect("/admin");
}
