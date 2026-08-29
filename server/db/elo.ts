import { count, desc, eq, inArray } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { alias } from "drizzle-orm/sqlite-core";
import {
  applyComparison,
  ELO_DEFAULT,
  inflateRDForTime,
  RD_DEFAULT,
} from "../lib/elo";
import { selectCount } from "./crud";
import type { Match } from "./schema";
import { categories, eloRecords, items, matches } from "./schema";

/**
 * Seeds an elo record for a newly created item (unrated).
 */
export async function createEloRecord(
  db: DrizzleD1Database,
  itemId: number,
  elo: number = ELO_DEFAULT,
) {
  const [record] = await db
    .insert(eloRecords)
    .values({ item_id: itemId, elo, rd: RD_DEFAULT })
    .returning();

  return record;
}

/**
 * Gets the EloRecord(s) of one or more items, returning as a map of id to row.
 */
export async function getElos(db: DrizzleD1Database, itemIds: number[]) {
  try {
    const response = await db
      .select()
      .from(eloRecords)
      .where(inArray(eloRecords.item_id, itemIds));

    const orderedById = new Map(response.map((row) => [row.item_id, row]));

    return orderedById;
  } catch (error) {
    throw new Error(`Could not find elos ${itemIds}: ${error}`);
  }
}

/**
 * Logs a match and updates elo accordingly.
 */
export async function logMatch(
  db: DrizzleD1Database,
  winnerId: number,
  loserId: number,
): Promise<D1Result[]> {
  try {
    const eloMap = await getElos(db, [winnerId, loserId]);
    const winnerElo = eloMap.get(winnerId);
    const loserElo = eloMap.get(loserId);

    if (winnerElo === undefined || loserElo === undefined)
      throw new Error(`Couldn't find one or more elos.`);

    const now = Date.now();
    const { a: newWinnerElo, b: newLoserElo } = applyComparison(
      winnerElo,
      loserElo,
      "a_win",
      now,
    );

    return await db.batch([
      db.insert(matches).values({
        winner_id: winnerId,
        loser_id: loserId,
        time_played: now,
      }),
      db
        .update(eloRecords)
        .set({
          elo: newWinnerElo.elo,
          rd: newWinnerElo.rd,
          comparisons: newWinnerElo.comparisons,
          last_played_at: newWinnerElo.last_played_at,
        })
        .where(eq(eloRecords.item_id, winnerId)),
      db
        .update(eloRecords)
        .set({
          elo: newLoserElo.elo,
          rd: newLoserElo.rd,
          comparisons: newLoserElo.comparisons,
          last_played_at: newLoserElo.last_played_at,
        })
        .where(eq(eloRecords.item_id, loserId)),
    ]);
  } catch (error) {
    throw new Error(
      `Failed to log match between ${winnerId} and ${loserId}: ${error}`,
    );
  }
}

export async function getRecentMatches(
  db: DrizzleD1Database,
  limit: number = 10,
): Promise<Match[]> {
  try {
    return await db
      .select()
      .from(matches)
      .orderBy(desc(matches.time_played))
      .limit(limit);
  } catch (error) {
    throw new Error(`Failed to fetch recent matches: ${error}`);
  }
}

export async function getTopRated(db: DrizzleD1Database, limit: number = 10) {
  try {
    return await db
      .select()
      .from(items)
      .rightJoin(eloRecords, eq(items.id, eloRecords.item_id))
      .orderBy(desc(eloRecords.elo))
      .limit(limit);
  } catch (error) {
    throw new Error(`Failed to fetch top rated: ${error}`);
  }
}

/**
 * Ranked leaderboard: items joined with their elo and category title,
 * ordered highest elo first.
 */
export async function getLeaderboard(
  db: DrizzleD1Database,
  limit: number = 10,
) {
  try {
    const rows = await db
      .select({
        title: items.title,
        elo: eloRecords.elo,
        category: categories.title,
      })
      .from(items)
      .innerJoin(eloRecords, eq(items.id, eloRecords.item_id))
      .leftJoin(categories, eq(items.category_id, categories.id))
      .orderBy(desc(eloRecords.elo))
      .limit(limit);

    return rows.map((row, index) => ({
      rank: index + 1,
      title: row.title ?? "Untitled",
      category: row.category ?? "Uncategorized",
      elo: Math.round(row.elo),
    }));
  } catch (error) {
    throw new Error(`Failed to fetch leaderboard: ${error}`);
  }
}

/**
 * Recent matches with winner/loser titles resolved, newest first.
 */
export async function getRecentActivity(
  db: DrizzleD1Database,
  limit: number = 10,
) {
  try {
    const winnerItems = alias(items, "winner_items");
    const loserItems = alias(items, "loser_items");

    const rows = await db
      .select({
        winner: winnerItems.title,
        loser: loserItems.title,
        timePlayed: matches.time_played,
      })
      .from(matches)
      .innerJoin(winnerItems, eq(matches.winner_id, winnerItems.id))
      .innerJoin(loserItems, eq(matches.loser_id, loserItems.id))
      .orderBy(desc(matches.time_played))
      .limit(limit);

    return rows.map((row) => ({
      winner: row.winner ?? "Untitled",
      loser: row.loser ?? "Untitled",
      timePlayed: row.timePlayed,
    }));
  } catch (error) {
    throw new Error(`Failed to fetch recent activity: ${error}`);
  }
}

/**
 * Picks a pair of items for the user to compare next: the most uncertain
 * item (highest time-inflated RD), paired with the closest-elo item from
 * the same high-RD pool so the outcome is actually informative.
 */
export async function getComparisonPair(
  db: DrizzleD1Database,
  poolSize: number = 50,
) {
  try {
    const now = Date.now();

    // Raw `rd` is only as fresh as the last write, so pull candidates by
    // stored rd first, then re-rank by effective (time-inflated) rd in JS.
    const candidates = await db
      .select()
      .from(items)
      .innerJoin(eloRecords, eq(items.id, eloRecords.item_id))
      .orderBy(desc(eloRecords.rd))
      .limit(poolSize);

    if (candidates.length < 2) return undefined;

    const ranked = candidates
      .map((row) => ({
        ...row,
        effectiveRd: inflateRDForTime(
          row.elo_records.rd,
          row.elo_records.last_played_at,
          now,
        ),
      }))
      .sort((a, b) => b.effectiveRd - a.effectiveRd);

    const [subject, ...rest] = ranked;

    const opponent = rest.reduce((closest, candidate) =>
      Math.abs(candidate.elo_records.elo - subject.elo_records.elo) <
      Math.abs(closest.elo_records.elo - subject.elo_records.elo)
        ? candidate
        : closest,
    );

    return [subject.items, opponent.items];
  } catch (error) {
    throw new Error(`Failed to fetch comparison pair: ${error}`);
  }
}

export async function getMatchCount(db: DrizzleD1Database): Promise<number> {
  return selectCount(db, matches);
}

/**
 * Every item joined with its elo and category title, highest elo first.
 * Used by the admin console, which needs the full roster (ids included)
 * rather than the leaderboard's top-N slice.
 */
export async function getAllItemsWithElo(db: DrizzleD1Database) {
  try {
    const rows = await db
      .select({
        id: items.id,
        title: items.title,
        category: categories.title,
        categoryId: items.category_id,
        elo: eloRecords.elo,
      })
      .from(items)
      .innerJoin(eloRecords, eq(items.id, eloRecords.item_id))
      .leftJoin(categories, eq(items.category_id, categories.id))
      .orderBy(desc(eloRecords.elo));

    return rows.map((row) => ({
      id: row.id,
      title: row.title ?? "Untitled",
      category: row.category ?? "Uncategorized",
      categoryId: row.categoryId,
      elo: Math.round(row.elo),
    }));
  } catch (error) {
    throw new Error(`Failed to fetch items with elo: ${error}`);
  }
}
