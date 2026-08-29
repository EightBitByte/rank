import Link from "next/link";

export function AdminHeader() {
  return (
    <header className="flex items-center justify-between py-10">
      <div className="flex items-baseline gap-2.5">
        <span className="font-display text-[30px] font-black tracking-[-0.5px]">
          RANK
        </span>
        <span className="rounded-full bg-[#111] px-[9px] py-[3px] font-display text-xs font-bold text-white">
          admin
        </span>
      </div>
      <Link
        href="/"
        className="font-display text-sm font-semibold text-rank-fg opacity-55"
      >
        ← Back to leaderboard
      </Link>
    </header>
  );
}
