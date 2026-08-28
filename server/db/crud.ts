import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { SQLiteColumn, SQLiteTable } from "drizzle-orm/sqlite-core";

/**
 * The shared shape behind every entity's create / list / delete. Each entity
 * module wraps these with its own concrete types so call sites stay typed.
 */
export type TableWithId = SQLiteTable & { id: SQLiteColumn };

export async function insertRow<T extends TableWithId>(
  db: DrizzleD1Database,
  table: T,
  data: T["$inferInsert"],
): Promise<T["$inferSelect"]> {
  const [row] = await db.insert(table).values(data).returning();
  return row as T["$inferSelect"];
}

export function selectAll<T extends SQLiteTable>(
  db: DrizzleD1Database,
  table: T,
): Promise<T["$inferSelect"][]> {
  return db.select().from(table) as Promise<T["$inferSelect"][]>;
}

export async function deleteById<T extends TableWithId>(
  db: DrizzleD1Database,
  table: T,
  id: number,
): Promise<T["$inferSelect"] | undefined> {
  const [row] = await db.delete(table).where(eq(table.id, id)).returning();
  return row as T["$inferSelect"] | undefined;
}
