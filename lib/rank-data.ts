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

export type TopItem = {
  title: string;
  description: string;
  category: string;
  elo: number;
  previewAssetHref: string | null;
  matches: { label: string; result: "win" | "loss" }[];
};

export type HeadToHead = {
  label: string;
  result: "win" | "loss";
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
