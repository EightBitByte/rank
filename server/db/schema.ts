import {
  type AnySQLiteColumn,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  color: text("color"),
});

export const assets = sqliteTable("assets", {
  id: integer("id").primaryKey(),
  item_id: integer("item_id").references((): AnySQLiteColumn => items.id),
  type: text("type").$type<"video" | "image">().default("image"),
  // v1: hotlink, cdn later maybe?
  href: text("href"),
});

export const items = sqliteTable("items", {
  id: integer("id").primaryKey(),
  category_id: integer("category_id").references(() => categories.id),
  title: text("title"),
  description: text("description"),
  preview_asset_id: integer("preview_asset_id").references(
    (): AnySQLiteColumn => assets.id,
  ),
});

// elo / rd are fractional (Glicko rating and rating deviation), so they're
// stored as REAL. Defaults match ELO_DEFAULT / RD_DEFAULT in src/elo.ts.
export const eloRecords = sqliteTable("elo_records", {
  item_id: integer("item_id")
    .primaryKey()
    .references(() => items.id),
  elo: real("elo").notNull().default(1500),
  rd: real("rd").notNull().default(350),
  comparisons: integer("comparisons").notNull().default(0),
  last_played_at: integer("last_played_at")
    .$defaultFn(() => Date.now())
    .notNull(),
});

export const matches = sqliteTable("matches", {
  winner_id: integer("winner_id")
    .references(() => items.id)
    .notNull(),
  loser_id: integer("loser_id")
    .references(() => items.id)
    .notNull(),
  time_played: integer("time_played")
    .$defaultFn(() => Date.now())
    .notNull(),
});

export type Category = typeof categories.$inferSelect;
export type Asset = typeof assets.$inferSelect;
export type Item = typeof items.$inferSelect;
export type EloRecord = typeof eloRecords.$inferSelect;
export type Match = typeof matches.$inferSelect;
