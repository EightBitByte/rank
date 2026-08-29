import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.08] pt-8">
      <span className="text-xs opacity-45">
        Movie &amp; TV data via TMDb · Game data via IGDB · Restaurant data via
        Google Places
      </span>
      <Link href="/admin" className="text-xs font-semibold opacity-60">
        Admin
      </Link>
    </footer>
  );
}
