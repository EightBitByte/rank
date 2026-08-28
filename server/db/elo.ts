import { desc, eq, inArray } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import {
  applyComparison,
  ELO_DEFAULT,
  inflateRDForTime,
  RD_DEFAULT,
} from "../lib/elo";
import type { Match } from "./schema";
import { eloRecords, items, matches } from "./schema";

/**
 * Seeds an elo record for a newly created item (unrated).
 */
export async function createEloRecord(db: DrizzleD1Database, itemId: number) {
  const [record] = await db
    .insert(eloRecords)
    .values({ item_id: itemId, elo: ELO_DEFAULT, rd: RD_DEFAULT })
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
