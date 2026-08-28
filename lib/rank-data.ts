export type CategoryKey = "all" | "movies" | "games" | "restaurants";

export type Category = {
  key: CategoryKey;
  label: string;
};

export type LeaderboardCategory = "GAMES" | "MOVIES" | "RESTAURANTS";

export type LeaderboardItem = {
  rank: number;
  title: string;
  category: LeaderboardCategory;
  elo: number;
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
  time: string;
};

export const heroStats = [
  { value: "1,248", label: "comparisons made" },
  { value: "312", label: "items ranked" },
  { value: "3", label: "categories, zero shame" },
];

export const categories: Category[] = [
  { key: "all", label: "All" },
  { key: "movies", label: "Movies & TV" },
  { key: "games", label: "Games" },
  { key: "restaurants", label: "Restaurants" },
];

export const leaderboard: LeaderboardItem[] = [
  { rank: 1, title: "Disco Elysium", category: "GAMES", elo: 1842 },
  {
    rank: 2,
    title: "The Grand Budapest Hotel",
    category: "MOVIES",
    elo: 1798,
  },
  { rank: 3, title: "Lin's Noodle House", category: "RESTAURANTS", elo: 1774 },
  { rank: 4, title: "Baldur's Gate 3", category: "GAMES", elo: 1751 },
  { rank: 5, title: "Parasite", category: "MOVIES", elo: 1733 },
  { rank: 6, title: "Kagawa Ramen", category: "RESTAURANTS", elo: 1690 },
  { rank: 7, title: "Hades", category: "GAMES", elo: 1662 },
  { rank: 8, title: "Avengers: Endgame", category: "MOVIES", elo: 1588 },
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

export const recentActivity: RecentActivity[] = [
  { winner: "Hades", loser: "Nobu Malibu", time: "12m ago" },
  { winner: "Parasite", loser: "The Room", time: "1h ago" },
  { winner: "Baldur's Gate 3", loser: "Kagawa Ramen", time: "3h ago" },
  { winner: "Disco Elysium", loser: "Avengers: Endgame", time: "6h ago" },
  { winner: "Lin's Noodle House", loser: "In-N-Out", time: "1d ago" },
];
