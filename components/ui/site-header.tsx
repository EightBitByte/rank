import packageJson from "@/package.json";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between py-10">
      <div className="flex items-center gap-2.5">
        <span className="font-display text-[30px] font-black tracking-[-0.5px]">
          RANK
        </span>
        <span className="rounded-full bg-[#111] px-[9px] py-[3px] font-display text-xs font-bold text-white">
          v{packageJson.version}
        </span>
      </div>
      <a
        href="example.com"
        className="font-display text-sm font-semibold text-rank-fg opacity-55"
      >
        Admin login →
      </a>
    </header>
  );
}
