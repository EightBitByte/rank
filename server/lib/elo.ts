import type { EloRecord } from "../db/schema";

// Glicko-defined constant, for elo conversion
const Q = Math.log(10) / 400;

const RD_MIN = 30; // Uncertainty Floor
const RD_MAX = 350; // Uncertainty Ceiling

// Seed values for a brand-new elo record (unrated item).
export const ELO_DEFAULT = 1500;
export const RD_DEFAULT = RD_MAX;

// How fast RD (uncertainty) inflates for items that haven't been compared in a while.
// RD_t = min(RD_MAX, sqrt(RD^2 + c^2 * periodsElapsed))
const RD_INFLATION_C = 12;
const RD_INFLATED_PERIOD_MS = 24 * 60 * 60 * 1000; // 1 period = 1 day

/**
 * The impact of an opponent's RD on the outcome's elo.
 * Lower RD (more certainty) => bigger g (larger impact).
 */
function g(rd: number): number {
  return 1 / Math.sqrt(1 + (3 * Q ** 2 * rd ** 2) / Math.PI ** 2);
}

/**
 * Expected probability of winning against an opponent, accounting for
 * opponent uncertainty.
 */
function expectedScore(elo: number, oppElo: number, oppRd: number): number {
  return 1 / (1 + 10 ** ((-g(oppRd) * (elo - oppElo)) / 400));
}

/**
 * Inflates RD for time passed since last comparison
 * (uncertainty grows when item is stale).
 */
export function inflateRDForTime(
  rd: number,
  lastPlayedAt: number,
  now: number,
): number {
  const periods = Math.max(0, (now - lastPlayedAt) / RD_INFLATED_PERIOD_MS);
  const inflated = Math.sqrt(rd ** 2 + RD_INFLATION_C ** 2 * periods);
  return Math.min(RD_MAX, inflated);
}

/**
 * Applies a single win/loss comparison between two items and
 * returns updated records.
 * Called once per vote
 */
export function applyComparison(
  a: EloRecord,
  b: EloRecord,
  result: "a_win" | "b_win",
  now: number = Date.now(),
): { a: EloRecord; b: EloRecord } {
  // inflate RD for both since we last saw them
  const aRd = inflateRDForTime(a.rd, a.last_played_at, now);
  const bRd = inflateRDForTime(b.rd, b.last_played_at, now);

  const scoreA = result === "a_win" ? 1 : 0;
  const scoreB = (1 - scoreA) as 1 | 0;

  return {
    a: updateRecord({ ...a, rd: aRd }, b.elo, bRd, scoreA, now),
    b: updateRecord({ ...b, rd: bRd }, a.elo, aRd, scoreB, now),
  };
}

function updateRecord(
  item: EloRecord,
  oppElo: number,
  oppRd: number,
  score: 0 | 1,
  now: number,
): EloRecord {
  const gOpp = g(oppRd);
  const expected = expectedScore(item.elo, oppElo, oppRd);

  // d^2: variance of the outcome given opponent information
  const dSquared = 1 / (Q ** 2 * gOpp ** 2 * expected * (1 - expected));

  const rdSquaredInv = 1 / item.rd ** 2 + 1 / dSquared;
  const newRd = Math.sqrt(1 / rdSquaredInv);
  const newElo = item.elo + Q * newRd ** 2 * gOpp * (score - expected);

  return {
    ...item,
    elo: newElo,
    rd: Math.max(RD_MIN, newRd),
    comparisons: item.comparisons + 1,
    last_played_at: now,
  };
}
