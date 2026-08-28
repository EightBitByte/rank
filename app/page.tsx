import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { CategoryFilter } from "@/components/ui/category-filter";
import { Leaderboard } from "@/components/ui/leaderboard";
import { RecentActivityList } from "@/components/ui/recent-activity";
import { SiteFooter } from "@/components/ui/site-footer";
import { SiteHeader } from "@/components/ui/site-header";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Stat } from "@/components/ui/stat";
import { formatRelativeTime } from "@/lib/format-time";
import { spotlight } from "@/lib/rank-data";
import { getAllCategories, getCategoryCount } from "@/server/db/categories";
import {
  getLeaderboard,
  getMatchCount,
  getRecentActivity,
} from "@/server/db/elo";
import { getItemCount } from "@/server/db/items";

export default async function Home() {
  const { env } = getCloudflareContext();
  const db = drizzle(env.DB);

  const [
    leaderboard,
    recentMatches,
    categories,
    matchCount,
    itemCount,
    categoryCount,
  ] = await Promise.all([
    getLeaderboard(db),
    getRecentActivity(db),
    getAllCategories(db),
    getMatchCount(db),
    getItemCount(db),
    getCategoryCount(db),
  ]);

  const recentActivity = recentMatches.map((match) => ({
    winner: match.winner,
    loser: match.loser,
    time: formatRelativeTime(match.timePlayed),
  }));

  return (
    <div className="mx-auto w-full max-w-[1180px] flex-1 px-8 pb-24">
      <SiteHeader />

      <section className="flex max-w-[760px] flex-col gap-5 py-6 pb-14">
        <h1 className="text-balance font-display text-[58px] font-black leading-[1.02] tracking-[-1.5px]">
          Movies. Games. Boba.
          <br />
          One leaderboard.
        </h1>
        <p className="max-w-[560px] text-lg leading-[1.55] opacity-75">
          Every single thing I've ever compared lives on the same Elo scale.
          Anything from <em>Disco Elysium</em> to my favorite local boba shop
          can go head-to-head. Are they fair comparisons? Probably not.
        </p>
        <div className="mt-2 flex gap-7">
          <Stat value={matchCount.toString()} label="comparisons made" />
          <Stat value={itemCount.toString()} label="items ranked" />
          <Stat value={categoryCount.toString()} label="categories of items" />
        </div>
      </section>

      <section className="pb-5">
        <CategoryFilter categories={categories.map((c) => c.title)} />
      </section>

      <section className="pt-5 pb-16">
        <div className="mb-[22px] flex items-baseline justify-between">
          <h2 className="font-display text-[28px] font-extrabold tracking-[-0.5px]">
            The Leaderboard
          </h2>
          <span className="text-[13px] font-medium opacity-50">
            updated after every vote
          </span>
        </div>
        <Leaderboard items={leaderboard} />
      </section>

      <section className="pb-16">
        <h2 className="mb-[22px] font-display text-[28px] font-extrabold tracking-[-0.5px]">
          #1 right now
        </h2>
        <SpotlightCard item={spotlight} />
      </section>

      <section className="pb-10">
        <h2 className="mb-[22px] font-display text-[28px] font-extrabold tracking-[-0.5px]">
          Recently rated
        </h2>
        <RecentActivityList items={recentActivity} />
      </section>

      <SiteFooter />
    </div>
  );
}
