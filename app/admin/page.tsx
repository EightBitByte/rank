import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminShell } from "@/components/admin/admin-shell";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAllCategories } from "@/server/db/categories";
import { getDb } from "@/server/db/crud";
import { getAllItemsWithElo } from "@/server/db/elo";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const { db } = getDb();

  const [items, categories] = await Promise.all([
    getAllItemsWithElo(db),
    getAllCategories(db),
  ]);

  return (
    <div className="mx-auto w-full max-w-[1180px] flex-1 px-8 pb-24">
      <AdminHeader />
      <AdminShell items={items} categories={categories} />
    </div>
  );
}
