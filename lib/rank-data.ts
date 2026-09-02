export type CategoryKey = "all" | "movies" | "games" | "restaurants";

export type Category = {
  key: CategoryKey;
  label: string;
};

export type LeaderboardCategory = "GAMES" | "MOVIES" | "RESTAURANTS";

export type LeaderboardItem = {
  rank: number;
  title: string;
  category: string;
  elo: number;
  previewAssetHref: string | null;
};

export type HeadToHead = {
  label: string;
  result: "win" | "loss";
};

export type Spotlight = {
  category: LeaderboardCategory;
  addedDaysAgo: number;
  title: string;
  elo: number;
  description: string;
  headToHeads: HeadToHead[];
  metadataSource: string;
};

export type RecentActivity = {
  winner: string;
  loser: string;
  time: number;
};

export const categories: Category[] = [
  { key: "all", label: "All" },
  { key: "movies", label: "Movies & TV" },
  { key: "games", label: "Games" },
  { key: "restaurants", label: "Restaurants" },
];

export const spotlight: Spotlight = {
  category: "GAMES",
  addedDaysAgo: 118,
  title: "Disco Elysium",
  elo: 1842,
  description:
    'A detective RPG where you can fail every skill check and somehow still solve the case. Undisputed champion of "games that made me feel things I didn\'t ask to feel."',
  headToHeads: [
    { label: "beat Avengers: Endgame", result: "win" },
    { label: "beat Nobu Malibu", result: "win" },
    { label: "lost to Baldur's Gate 3", result: "loss" },
  ],
  metadataSource: "Metadata via IGDB",
};
