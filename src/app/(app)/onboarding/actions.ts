"use server";

import { redirect } from "next/navigation";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { profileSchema } from "@/lib/profile-options";

// Runs on the server. Never trust what the browser sends: check the login,
// then check every answer before saving.
export async function saveProfile(input: unknown): Promise<{ error: string }> {
  const { user } = await requireSession();

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Some answers are missing. Check the form and try again." };
  }

  const data = parsed.data;
  await db
    .insert(profiles)
    .values({ userId: user.id, ...data })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: { ...data, updatedAt: new Date() },
    });

  redirect("/plan");
}
