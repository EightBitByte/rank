import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import {
  deleteById,
  insertRow,
  selectAll,
  selectCount,
  updateById,
} from "./crud";
import { categories } from "./schema";

type NewCategory = typeof categories.$inferInsert;

export function createCategory(db: DrizzleD1Database, data: NewCategory) {
  return insertRow(db, categories, data);
}

export function getAllCategories(db: DrizzleD1Database) {
  return selectAll(db, categories);
}

export async function getCategoryById(
  db: DrizzleD1Database,
  categoryId: number,
) {
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, categoryId));
  return category;
}

export function deleteCategory(db: DrizzleD1Database, categoryId: number) {
  return deleteById(db, categories, categoryId);
}

export function updateCategory(
  db: DrizzleD1Database,
  categoryId: number,
  data: Partial<NewCategory>,
) {
  return updateById(db, categories, categoryId, data);
}

export async function getCategoryCount(db: DrizzleD1Database): Promise<number> {
  return selectCount(db, categories);
}
